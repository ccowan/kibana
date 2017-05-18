import getIntervalAndTimefield from './get_interval_and_timefield';
import _ from 'lodash';
import getTimerange from './helpers/get_timerange';
export function getHosts(req, panel) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const { timeField } = getIntervalAndTimefield(panel);
  const { from, to } = getTimerange(req);

  const page = req.payload.page || 1;
  const pageSize = req.payload.pageSize || panel.page_size || 20;
  const pageFrom = ((page - 1) * pageSize);

  const sortField = panel.display_field || panel.id_field;
  const order = _.get(req, 'payload.sort.order', 'asc');

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
      _source: [panel.id_field],
      sort: [{ [sortField]: { order } }],
      from: pageFrom,
      size: pageSize,
      aggs: {
        hostCount: {
          cardinality: { field: panel.id_field }
        }
      }
    }
  };

  if (panel.display_field) params.body._source.push(panel.display_field);

  const globalFilters = req.payload.filters;
  if (globalFilters && !panel.ignore_global_filter) {
    params.body.query.bool.must = params.body.query.bool.must.concat(globalFilters);
  }

  if (panel.filter) {
    params.body.query.bool.must.push({
      query_string: {
        query: panel.filter,
        analyze_wildcard: true
      }
    });
  }

  return callWithRequest(req, 'search', params)
    .then(resp => {
      return {
        hosts: resp.hits.hits.map(doc => doc._source),
        total: _.get(resp, 'aggregations.hostCount.value')
      };
    });
}
