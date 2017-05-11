import _ from 'lodash';
import getBucketSize from '../../helpers/get_bucket_size';
import getIntervalAndTimefield from '../../get_interval_and_timefield';
import getTimerange from '../../helpers/get_timerange';
export default function dateHistogram(req, panel) {
  return next => doc => {
    const { timeField, interval } = getIntervalAndTimefield(panel);
    const { bucketSize, intervalString } = getBucketSize(req, interval);
    const { from, to }  = getTimerange(req);
    panel.columns.forEach(column => {
      _.set(doc, `aggs.${column.id}.aggs.timeseries.date_histogram`, {
        field: timeField,
        interval: intervalString,
        min_doc_count: 0,
        extended_bounds: {
          min: from.valueOf(),
          max: to.valueOf() - (bucketSize * 1000)
        }
      });
    });
    return next(doc);
  };
}
