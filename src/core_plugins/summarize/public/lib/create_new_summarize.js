import { newColumnFn } from './new_column_fn';
import uuid from 'node-uuid';
export function createNewSummarize() {
  return {
    id: uuid.v1(),
    columns: [newColumnFn()],
    time_field: '@timestamp',
    index_pattern: '*',
    interval: 'auto',
    indexing_frequency: 60000,
    target_index: '',
    page_size: 10,
    filter: '',
    ignore_global_filter: 0,
    from_value: 1,
    from_units: 'h',
    to_value: 1,
    to_units: 'm'
  };
}
