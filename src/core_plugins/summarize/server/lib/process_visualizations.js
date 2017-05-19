import { getVisualizations } from './get_visualizations';
import { getVis } from './get_vis';
import Promise from 'bluebird';
import { runIndexing } from './run_indexing';
import { createMappings } from './create_mappings';


const visQueue = {};

function checkForNewVisualizations(server) {
  const config = server.config();
  const CHECK_INTERVAL = config.get('summarize.checkInterval');
  server.log(['debug', 'summarize'], 'Checking for new visualizations');
  getVisualizations(server).then(docs => {
    docs.forEach(doc => {
      if (!visQueue[doc._id]) indexVis(server, doc);
      if (!doc.visState.params.indexing && visQueue[doc._id]) {
        server.log(['debug', 'summarize'], `Stopping indexing for ${doc.title} (${doc._id})`);
        clearTimeout(visQueue[doc._id]);
        delete visQueue[doc._id];
      }
    });
  }).then(() => Promise.delay(CHECK_INTERVAL).then(() => {
    return checkForNewVisualizations(server);
  }));
}

function startIndexing(server, doc) {
  const model = doc.visState.params;
  return setTimeout(() => {
    indexVis(server, doc);
  }, model.indexing_frequency || 60000);
}

function indexVis(server, doc) {
  return getVis(server, doc).then(vis => {
    const id = vis._id;
    const model = vis.visState.params;
    if (visQueue[id]) clearTimeout(visQueue[id]);
    if (model.indexing) {
      server.log(['debug', 'summarize'], `Indexing ${vis.title} (${id})`);
      return createMappings(server, vis).then(() => {
        const start = Date.now();
        return runIndexing(server, vis).then(docs => {
          const timing = Date.now() - start;
          server.log(['debug', 'summarize', 'benchmark'], {
            time: timing,
            id: vis._id,
            total: docs.length,
            tmpl: `Indexing for ${vis.title} (<%= id %>) completed in <%= time %>ms, <%= total %> documents indexed.`
          });
          visQueue[id] = startIndexing(server, vis);
        });
      });
    } else if (visQueue[id]) {
      delete visQueue[id];
    }
  });
}


export function processVisualizations(server) {
  checkForNewVisualizations(server);
}
