import _ from 'lodash';
export function getData(req) {
  const { panel } = req.payload;
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const page = req.payload.page || 1;
  const pageSize = req.payload.pageSize || panel.page_size || 20;
  const pageFrom = ((page - 1) * pageSize);

  let sortField = _.get(req, 'payload.sort.field');
  if (!sortField) sortField = panel.display_field || panel.id_field;

  const order = _.get(req, 'payload.sort.order', 'asc');

  if (!panel.target_index) return Promise.resolve({ total: 0, data: [] });

  const params = {
    index: panel.target_index,
    ignore: [404],
    body: {
      query: { bool: { must: [] } },
      sort: [{ [sortField]: { order } }],
      from: pageFrom,
      size: pageSize
    }
  };

  const globalFilters = req.payload.filters;
  if (globalFilters && !panel.ignore_global_filter) {
    params.body.query.bool.must = params.body.query.bool.must.concat(globalFilters);
  }

  return callWithRequest(req, 'search', params)
    .then(resp => {
      if (!resp.hits) return { total: 0, data: [] };
      const { hits, total } = resp.hits;
      return {
        total,
        data: hits.map(doc => doc._source)
      };
    });
}
