import getBucketSize from '../../helpers/get_bucket_size';
import _ from 'lodash';
import getTimerange from '../../helpers/get_timerange';
import getIntervalAndTimefield from '../../get_interval_and_timefield';
export default function query(req, panel, host) {
  return next => doc => {
    const { timeField, interval } = getIntervalAndTimefield(panel);
    const { bucketSize } = getBucketSize(req, interval);
    const { from, to } = getTimerange(req);

    doc.size = 0;
    doc.query = {
      bool: {
        must: []
      }
    };

    const timerange = {
      range: {
        [timeField]: {
          gte: from.valueOf(),
          lte: to.valueOf() - (bucketSize * 1000),
          format: 'epoch_millis',
        }
      }
    };
    doc.query.bool.must.push(timerange);

    doc.query.bool.must.push({
      term: {
        [panel.id_field]: _.get(host, panel.id_field)
      }
    });

    const globalFilters = req.payload.filters;
    if (globalFilters && !panel.ignore_global_filter) {
      doc.query.bool.must = doc.query.bool.must.concat(globalFilters);
    }

    if (panel.filter) {
      doc.query.bool.must.push({
        query_string: {
          query: panel.filter,
          analyze_wildcard: true
        }
      });
    }

    return next(doc);

  };
}
