import _ from 'lodash';
export function calculateAggRoot(doc, column) {
  let aggRoot = `aggs.${column.id}.aggs`;
  if (_.has(doc,  `aggs.${column.id}.aggs.column_filter`)) {
    aggRoot = `aggs.${column.id}.aggs.column_filter.aggs`;
  }
  return aggRoot;
}
