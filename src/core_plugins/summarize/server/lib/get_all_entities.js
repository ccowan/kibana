import _ from 'lodash';
import moment from 'moment';
export function getAllEntities(server, doc) {
  const panel = doc.visState.params;
  const client = server.plugins.elasticsearch.getCluster('data').callWithInternalUser;

  const from = moment.utc().subtract(panel.from_value, panel.from_units).valueOf();
  const to = moment.utc().subtract(panel.to_value, panel.to_units).valueOf();

  const params = {
    index: panel.index_pattern,
    body: {
      aggs: {
        entityCount: {
          cardinality: { field: panel.id_field }
        }
      }
    }
  };

  return client('search', params)
    .then(resp => {
      const totalEntities = _.get(resp, 'aggregations.entityCount.value');
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
          size: totalEntities
        }
      };

      if (panel.display_field) params.body._source.push(panel.display_field);

      if (panel.filter) {
        params.body.query.bool.must.push({
          query_string: {
            query: panel.filter,
            analyze_wildcard: true
          }
        });
      }

      return client('search', params);
    })
    .then(resp => {
      return resp.hits.hits.map(doc => doc._source);
    });

}

