export function getVis(server, doc) {
  const { elasticsearch } = server.plugins;
  const config = server.config();
  const callAdminAsKibanaUser = elasticsearch.getCluster('admin').callWithInternalUser;
  const params = {
    index: config.get('kibana.index'),
    type: 'visualization',
    id: doc._id
  };
  return callAdminAsKibanaUser('get', params)
    .then(resp => {
      const source = resp._source;
      source._id = resp._id;
      source.visState = JSON.parse(resp._source.visState);
      return source;
    });
}
