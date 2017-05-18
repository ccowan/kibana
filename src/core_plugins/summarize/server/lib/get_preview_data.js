import { getEntities } from './preview/get_entities';
import { getColumnData } from './preview/get_column_data';
export function getPreviewData(req) {
  const { panel } = req.payload;
  if (!panel.id_field) {
    const err = new Error('You must provide an ID field.');
    return Promise.reject(err);
  }
  return getEntities(req, panel).then(results => {
    if (!results.total) return results;
    return getColumnData(req, panel, results.entities)
      .then(data => {
        return { data, total: results.total };
      });
  });
}
