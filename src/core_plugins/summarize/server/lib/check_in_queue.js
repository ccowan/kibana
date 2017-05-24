export function checkInQueue(server, doc, queue) {
  const { elasticsearch } = server.plugins;
  const callAdminAsKibanaUser = elasticsearch.getCluster('admin').callWithInternalUser;
  const params = {
    index: `${queue.index}-*`,
    body: {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: {
                created_by: doc._id
              }
            }
          ],
          must_not: [
            {
              terms: {
                status: [
                  'completed',
                  'cancelled',
                  'failed'
                ]
              }
            }
          ]
        }
      }
    }
  };

  return callAdminAsKibanaUser('search', params).then(resp => {
    const { total } = resp.hits;
    return total > 0;
  });
}
