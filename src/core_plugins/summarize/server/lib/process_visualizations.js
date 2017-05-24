import { getVisualizations } from './get_visualizations';
import { getVis } from './get_vis';
import Promise from 'bluebird';
import { runIndexing } from './run_indexing';
import { createMappings } from './create_mappings';
import { checkInQueue } from './check_in_queue';

import Esqueue from 'esqueue';

const INDEX_VIS_TASK = 'index-vis';
const logTags = ['debug', 'summarize'];

function createLogger(server) {
  return (data, tags = []) => {
    server.log([...logTags, ...tags], data);
  };
}

function checkForNewVisualizations(server, queue) {
  const config = server.config();
  const log = createLogger(server);
  const CHECK_INTERVAL = config.get('summarize.queue.checkInterval');
  const JOB_TIMEOUT = config.get('summarize.queue.jobTimeout');
  log('Checking for new visualizations');
  getVisualizations(server).then(docs => {
    log(`Found ${docs.length} visualizations`);
    Promise.each(docs.filter(doc => doc.visState.params.indexing), doc => {
      return checkInQueue(server, doc, queue).then(exists => {
        log(`${doc.title} (${doc._id}) ${exists ? 'already exists' : 'does not exist'}`);
        if (!exists) {
          const { _id } = doc;
          log(`Creating indexing for ${doc.title} (${_id})`);
          queue.addJob(INDEX_VIS_TASK, { _id }, {
            timeout: doc.visState.params.indexing_frequency + JOB_TIMEOUT,
            created_by: _id
          });
        }
      });
    });
  }).then(() => Promise.delay(CHECK_INTERVAL).then(() => {
    return checkForNewVisualizations(server, queue);
  })).catch(err => console.log(err));
}

function indexVis(server, doc) {
  const log = createLogger(server);
  return getVis(server, doc).then(vis => {
    const model = vis.visState.params;
    if (model.indexing) {
      return createMappings(server, vis).then(() => {
        const start = Date.now();
        return runIndexing(server, vis).then(docs => {
          const timing = Date.now() - start;
          const loggingDetails = {
            time: timing,
            id: vis._id,
            total: docs.length
          };
          log({
            ...loggingDetails,
            tmpl: `Indexing for ${vis.title} (<%= id %>) completed in <%= time %>ms, <%= total %> documents indexed.`
          });
          return loggingDetails;
        });
      })
      .then((resp) => {
        return Promise.delay(model.indexing_frequency).then(() => resp);
      });
    }
    return Promise.resolve({ skipped: true });
  });
}

export function createWorkers(server, queue) {
  const log = createLogger(server);
  function indexVisTask(payload) {
    log(`Processing job for ${payload._id}`);
    return indexVis(server, payload, queue);
  }
  log(`Creating workers for ${INDEX_VIS_TASK}`);
  queue.registerWorker(INDEX_VIS_TASK, indexVisTask, {});
}

export function createQueue(server) {
  const { getClient } = server.plugins.elasticsearch.getCluster('admin');
  const config = server.config();
  const index = config.get('summarize.queue.index');
  const options = {
    interval: 'day',
    dateSeparator: '.',
    client: getClient()
  };
  const queue = new Esqueue(index, options);
  if (config.get('summarize.queue.startWorkers')) {
    createWorkers(server, queue);
  }
  return queue;
}

export function processVisualizations(plugin, server) {
  const { elasticsearch } = server.plugins;
  const config = server.config();
  elasticsearch.status.once('green', () => {
    const queue = createQueue(server);
    if (config.get('summarize.queue.startWatcher')) {
      checkForNewVisualizations(server, queue);
    }
  });
}
