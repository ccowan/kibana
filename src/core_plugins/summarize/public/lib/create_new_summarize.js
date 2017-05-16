import { newColumnFn } from './new_column_fn';
import uuid from 'node-uuid';
export function createNewSummarize() {
  return {
    id: uuid.v1(),
    columns: [newColumnFn()],
    time_field: '@timestamp',
    index_pattern: '*',
    interval: 'auto',
    run_interval: 60000,
    page_size: 10,
    filter: '',
    ignore_global_filter: 0
  };
}
