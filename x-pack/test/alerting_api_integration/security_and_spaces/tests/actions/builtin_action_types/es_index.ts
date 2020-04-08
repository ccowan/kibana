/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';

import { FtrProviderContext } from '../../../../common/ftr_provider_context';

const ES_TEST_INDEX_NAME = 'functional-test-actions-index';

// eslint-disable-next-line import/no-default-export
export default function indexTest({ getService }: FtrProviderContext) {
  const es = getService('legacyEs');
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');

  describe('index action', () => {
    after(() => esArchiver.unload('empty_kibana'));
    beforeEach(() => clearTestIndex(es));

    let createdActionID: string;
    let createdActionIDWithIndex: string;

    it('should be created successfully', async () => {
      // create action with no config
      const { body: createdAction } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action',
          actionTypeId: '.index',
          config: {
            index: ES_TEST_INDEX_NAME,
          },
          secrets: {},
        })
        .expect(200);

      expect(createdAction).to.eql({
        id: createdAction.id,
        isPreconfigured: false,
        name: 'An index action',
        actionTypeId: '.index',
        config: {
          index: ES_TEST_INDEX_NAME,
          refresh: false,
          executionTimeField: null,
        },
      });
      createdActionID = createdAction.id;
      expect(typeof createdActionID).to.be('string');

      const { body: fetchedAction } = await supertest
        .get(`/api/action/${createdActionID}`)
        .expect(200);

      expect(fetchedAction).to.eql({
        id: fetchedAction.id,
        isPreconfigured: false,
        name: 'An index action',
        actionTypeId: '.index',
        config: { index: ES_TEST_INDEX_NAME, refresh: false, executionTimeField: null },
      });

      // create action with all config props
      const { body: createdActionWithIndex } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action with index config',
          actionTypeId: '.index',
          config: {
            index: ES_TEST_INDEX_NAME,
            refresh: true,
            executionTimeField: 'test',
          },
        })
        .expect(200);

      expect(createdActionWithIndex).to.eql({
        id: createdActionWithIndex.id,
        isPreconfigured: false,
        name: 'An index action with index config',
        actionTypeId: '.index',
        config: {
          index: ES_TEST_INDEX_NAME,
          refresh: true,
          executionTimeField: 'test',
        },
      });
      createdActionIDWithIndex = createdActionWithIndex.id;
      expect(typeof createdActionIDWithIndex).to.be('string');

      const { body: fetchedActionWithIndex } = await supertest
        .get(`/api/action/${createdActionIDWithIndex}`)
        .expect(200);

      expect(fetchedActionWithIndex).to.eql({
        id: fetchedActionWithIndex.id,
        isPreconfigured: false,
        name: 'An index action with index config',
        actionTypeId: '.index',
        config: {
          index: ES_TEST_INDEX_NAME,
          refresh: true,
          executionTimeField: 'test',
        },
      });
    });

    it('should respond with error when creation unsuccessful', async () => {
      await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action',
          actionTypeId: '.index',
          config: { index: 666 },
        })
        .expect(400)
        .then((resp: any) => {
          expect(resp.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message:
              'error validating action type config: [index]: expected value of type [string] but got [number]',
          });
        });
    });

    it('should execute successly when expected for a single body', async () => {
      const { body: createdAction } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action',
          actionTypeId: '.index',
          config: {
            index: ES_TEST_INDEX_NAME,
            refresh: true,
          },
          secrets: {},
        })
        .expect(200);
      const { body: result } = await supertest
        .post(`/api/action/${createdAction.id}/_execute`)
        .set('kbn-xsrf', 'foo')
        .send({
          params: {
            documents: [{ testing: [1, 2, 3] }],
          },
        })
        .expect(200);
      expect(result.status).to.eql('ok');

      const items = await getTestIndexItems(es);
      expect(items.length).to.eql(1);
      expect(items[0]._source).to.eql({ testing: [1, 2, 3] });
    });

    it('should execute successly when expected for with multiple bodies', async () => {
      const { body: createdAction } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action',
          actionTypeId: '.index',
          config: {
            index: ES_TEST_INDEX_NAME,
            refresh: true,
          },
          secrets: {},
        })
        .expect(200);
      const { body: result } = await supertest
        .post(`/api/action/${createdAction.id}/_execute`)
        .set('kbn-xsrf', 'foo')
        .send({
          params: {
            documents: [{ testing: [1, 2, 3] }, { Testing: [4, 5, 6] }],
          },
        })
        .expect(200);
      expect(result.status).to.eql('ok');

      const items = await getTestIndexItems(es);
      expect(items.length).to.eql(2);
      let passed1 = false;
      let passed2 = false;
      for (const item of items) {
        if (item._source.testing != null) {
          expect(item._source).to.eql({ testing: [1, 2, 3] });
          passed1 = true;
        }

        if (item._source.Testing != null) {
          expect(item._source).to.eql({ Testing: [4, 5, 6] });
          passed2 = true;
        }
      }
      expect(passed1).to.be(true);
      expect(passed2).to.be(true);
    });

    it('should execute successly with refresh false', async () => {
      const { body: createdAction } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action',
          actionTypeId: '.index',
          config: {
            index: ES_TEST_INDEX_NAME,
            refresh: false,
            executionTimeField: 'test',
          },
          secrets: {},
        })
        .expect(200);
      const { body: result } = await supertest
        .post(`/api/action/${createdAction.id}/_execute`)
        .set('kbn-xsrf', 'foo')
        .send({
          params: {
            documents: [{ refresh: 'not set' }],
          },
        })
        .expect(200);
      expect(result.status).to.eql('ok');

      let items;
      items = await getTestIndexItems(es);
      expect(items.length).to.be.lessThan(2);

      const { body: createdActionWithRefresh } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          name: 'An index action',
          actionTypeId: '.index',
          config: {
            index: ES_TEST_INDEX_NAME,
            refresh: true,
          },
          secrets: {},
        })
        .expect(200);
      const { body: result2 } = await supertest
        .post(`/api/action/${createdActionWithRefresh.id}/_execute`)
        .set('kbn-xsrf', 'foo')
        .send({
          params: {
            documents: [{ refresh: 'true' }],
          },
        })
        .expect(200);
      expect(result2.status).to.eql('ok');

      items = await getTestIndexItems(es);
      expect(items.length).to.eql(2);
    });
  });
}

async function clearTestIndex(es: any) {
  return await es.indices.delete({
    index: ES_TEST_INDEX_NAME,
    ignoreUnavailable: true,
  });
}

async function getTestIndexItems(es: any) {
  const result = await es.search({
    index: ES_TEST_INDEX_NAME,
  });

  return result.hits.hits;
}
