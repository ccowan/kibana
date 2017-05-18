import { getVisualizations } from './get_visualizations';
import { getVis } from './get_vis';
import Promise from 'bluebird';
import { runIndexing } from './run_indexing';

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
  getVis(server, doc).then(vis => {
    const id = doc._id;
    const model = doc.visState.params;
    if (visQueue[id]) clearTimeout(visQueue[id]);
    if (model.indexing) {
      server.log(['debug', 'summarize'], `Indexing ${vis.title} (${id})`);
      const start = Date.now();
      runIndexing(server, doc).then(docs => {
        const timing = Date.now() - start;
        server.log(['debug', 'summarize', 'benchmark'], {
          time: timing,
          id: doc._id,
          total: docs.length,
          tmpl: `Indexing for ${doc.title} (<%= id %>) completed in <%= time %>ms, <%= total %> documents indexed.`
        });
        visQueue[id] = startIndexing(server, vis);
      });
    } else if (visQueue[id]) {
      delete visQueue[id];
    }
  });
}


export function processVisualizations(server) {
  checkForNewVisualizations(server);
}
