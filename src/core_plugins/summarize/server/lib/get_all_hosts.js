import _ from 'lodash';
import moment from 'moment';
export function getAllHosts(server, doc) {
  const panel = doc.visState.params;
  const client = server.plugins.elasticsearch.getCluster('data').callWithInternalUser;

  const from = moment.utc().subtract(panel.from_value, panel.from_units).valueOf();
  const to = moment.utc().subtract(panel.to_value, panel.to_units).valueOf();

  const params = {
    index: panel.index_pattern,
    body: {
      aggs: {
        hostCount: {
          cardinality: { field: panel.id_field }
        }
      }
    }
  };

  return client('search', params)
    .then(resp => {
      const totalHosts = _.get(resp, 'aggregations.hostCount.value');
      const params = {
        index: panel.index_pattern,
        body: {
          query: {
            bool: {
              must: [
                {
                  range: {
                    [panel.time_field]: {
                      gte: from,
                      lte: to,
                      format: 'epoch_millis'
                    }
                  }
                }
              ]
            }
          },
          collapse: { field: panel.id_field },
          _source: [panel.id_field],
          from: 0,
          size: totalHosts
        }
      };

      return client('search', params);
    })
    .then(resp => {
      return resp.hits.hits.map(doc => doc._source);
    });

}

