import _ from 'lodash';

export default function splitByTerm(req, panel) {
  return next => doc => {
    panel.columns.filter(c => c.aggregate_by && c.aggregate_function).forEach(column => {
      _.set(doc, `aggs.${column.id}.terms.field`, column.aggregate_by);
      _.set(doc, `aggs.${column.id}.terms.size`, 100);
      if (column.filter) {
        _.set(doc, `aggs.${column.id}.aggs.column_filter.filter.query_string.query`, column.filter);
        _.set(doc, `aggs.${column.id}.aggs.column_filter.filter.query_string.analyze_wildcard`, true);
      }
    });
    return next(doc);
  };
}


