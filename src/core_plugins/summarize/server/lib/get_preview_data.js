import { getHosts } from './preview/get_hosts';
import { getColumnData } from './preview/get_column_data';
export function getPreviewData(req) {
  const { panel } = req.payload;
  if (!panel.id_field) {
    const err = new Error('You must provide an ID field.');
    return Promise.reject(err);
  }
  return getHosts(req, panel).then(hosts => {
    return getColumnData(req, panel, hosts);
  })
  .then(data => {
    return { data };
  });
}
