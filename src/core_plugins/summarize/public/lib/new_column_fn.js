import uuid from 'node-uuid';
import { newMetricFn } from './new_metric_fn';
export function newColumnFn() {
  return {
    id: uuid.v1(),
    metrics: [newMetricFn()]
  };
}
