import { getAllEntities } from './get_all_entities';
import moment from 'moment';
import _ from 'lodash';
import Promise from 'bluebird';
import { getColumnData } from './preview/get_column_data';
export function runIndexing(server, doc) {
  return getAllEntities(server, doc).then(docs => {
    if (!docs.length) return Promise.resolve();

    const batches = docs.reduce((acc, doc) => {
      if(_.last(acc).length < 50) {
        _.last(acc).push(doc);
      } else {
        acc.push([doc]);
      }
      return acc;
    }, [[]]);

    const client = server.plugins.elasticsearch.getCluster('summarize').callWithInternalUser;
    const panel = doc.visState.params;
    const from = moment.utc().subtract(panel.from_value, panel.from_units);
    const to = moment.utc().subtract(panel.to_value, panel.to_units);
    const updatedOn = moment.utc().toISOString();
    const req = {
      payload: {
        filters: [],
        panel,
        timerange: {
          max: to.toISOString(),
          min: from.toISOString()
        }
      }
    };

    return Promise.map(batches, (docs) => {
      return getColumnData(req, panel, docs, client)
        .then(results => {
          const body = [];
          if (!results) return Promise.resolve([]);
          results.forEach(doc => {
            const _id = _.get(doc, panel.id_field);
            body.push({
              index: {
                _index: panel.target_index,
                _type: 'doc',
                _id
              }
            });
            body.push({
              '@updatedOn': updatedOn,
              ...doc
            });
          });
          return client('bulk', { body });
        });
    }).then(() => {
      return docs;
    });

  });
}
