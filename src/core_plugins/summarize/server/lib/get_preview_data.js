import { getHosts } from './preview/get_hosts';
import { getColumnData } from './preview/get_column_data';
export function getPreviewData(req) {
  const { panel } = req.payload;
  if (!panel.id_field) {
    const err = new Error('You must provide an ID field.');
    return Promise.reject(err);
  }
  return getHosts(req, panel).then(results => {
    if (!results.total) return results;
    return getColumnData(req, panel, results.hosts)
      .then(data => {
        return { data, total: results.total };
      });
  });
}
