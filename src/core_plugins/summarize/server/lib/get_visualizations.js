export function getVisualizations(server) {
  const { elasticsearch } = server.plugins;
  const config = server.config();
  const callAdminAsKibanaUser = elasticsearch.getCluster('admin').callWithInternalUser;
  const visualizations = [];

  const params = {
    index: config.get('kibana.index'),
    type: 'visualization',
    scroll: '30s',
    size: 100
  };
  return callAdminAsKibanaUser('search', params)
    .then(function getMoreResults(resp) {
      if (!resp.hits) return visualizations;
      const { total, hits } = resp.hits;
      if (hits) {
        hits.forEach(hit => {
          const source = hit._source;
          source._id = hit._id;
          source.visState = JSON.parse(hit._source.visState);
          visualizations.push(source);
        });
      }
      if (total !== visualizations.length) {
        return callAdminAsKibanaUser('scroll', {
          scrollId: resp._scroll_id,
          scroll: '30s'
        }).then(getMoreResults);
      }
      return visualizations;
    }).then(docs => {
      return docs.filter(doc => doc.visState.type === 'summarize');
    });
}
