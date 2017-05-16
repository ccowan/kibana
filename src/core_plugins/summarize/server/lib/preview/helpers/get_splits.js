import calculateLabel from '../../../../common/calculate_label';
import _ from 'lodash';
import getLastMetric from './get_last_metric';
import { formatKey } from './format_key';
export default function getSplits(resp, panel, series) {
  const metric = getLastMetric(series);
  if (_.has(resp, `aggregations.${series.id}.buckets`)) {
    const buckets = _.get(resp, `aggregations.${series.id}.buckets`);
    if (_.isArray(buckets)) {
      return buckets.map(bucket => {
        bucket.id = `${series.id}:${bucket.key}`;
        bucket.label = formatKey(bucket.key, series);
        if (bucket.column_filter) {
          bucket.timeseries = bucket.column_filter.timeseries;
        }
        return bucket;
      });
    }
  }

  const timeseries = _.get(resp, `aggregations.${series.id}.timeseries`);
  const mergeObj = {
    timeseries
  };
  series.metrics
    .filter(m => /_bucket/.test(m.type))
    .forEach(m => {
      mergeObj[m.id] = _.get(resp, `aggregations.${series.id}.${m.id}`);
    });
  return [
    {
      id: series.id,
      label: series.label || calculateLabel(metric, series.metrics),
      ...mergeObj
    }
  ];
}


