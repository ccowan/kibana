import uuid from 'node-uuid';
export function newMetricFn() {
  return {
    id: uuid.v1(),
    type: 'count'
  };
}
