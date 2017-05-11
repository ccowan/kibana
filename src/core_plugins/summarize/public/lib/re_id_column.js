import uuid from 'node-uuid';
import _ from 'lodash';
export function reIdColumn(source) {
  const column = _.cloneDeep(source);
  column.id = uuid.v1();
  column.metrics.forEach((metric) => {
    const id = uuid.v1();
    const metricId = metric.id;
    metric.id = id;
    column.metrics.filter(r => r.field === metricId).forEach(r => r.field = id);
    column.metrics.filter(r => r.type === 'calculation' &&
      r.variables.some(v => v.field === metricId))
      .forEach(r => {
        r.variables.filter(v => v.field === metricId).forEach(v => {
          v.id = uuid.v1();
          v.field = id;
        });
      });
  });
  return column;
}

