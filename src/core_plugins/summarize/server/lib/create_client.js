import _ from 'lodash';
export function setupClient(server) {

  const config = server.config();
  const { elasticsearch } = server.plugins;
  const Logger = elasticsearch.ElasticsearchClientLogging;

  // Create the logger for summarize
  class SummarizeClientLogging extends Logger {
    constructor() {
      super();
      this.tags = [config.get('summarize.logTags')];
      this.logQueries = config.get('summarize.logQueries');
    }
  }

  // Try to load the specific client for summarize
  let esConfig = {
    ...server.config().get('summarize.elasticsearch')
  };

  // If there isn't a defined summarize client then use the default
  // client for Kibana
  if (!Boolean(esConfig.url)) {
    esConfig = config.get('elasticsearch');
  }

  // Create the summarize cluster
  esConfig.log = SummarizeClientLogging;
  const cluster = elasticsearch.createCluster('summarize', esConfig);
  server.on('close', _.bindKey(cluster, 'close'));
}

export const createClient = _.once(setupClient);
