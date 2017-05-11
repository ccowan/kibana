import getIntervalAndTimefield from './get_interval_and_timefield';
import getTimerange from './helpers/get_timerange';
export function getHosts(req, panel) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const { timeField } = getIntervalAndTimefield(panel);
  const { from, to } = getTimerange(req);

  const params = {
    index: panel.index_pattern,
    body: {
      query: {
        bool: {
          must: [
            {
              range: {
                [timeField]: {
                  gte: from.valueOf(),
                  lte: to.valueOf(),
                  format: 'epoch_millis'
                }
              }
            }
          ]
        }
      },
      collapse: { field: panel.id_field },
      _source: [panel.id_field]
    }
  };

  if (panel.display_field) params.body._source.push(panel.display_field);

  return callWithRequest(req, 'search', params)
    .then(resp => {
      return resp.hits.hits.map(doc => doc._source);
    });
}
