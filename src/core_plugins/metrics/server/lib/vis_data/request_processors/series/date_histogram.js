/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import getBucketSize from '../../helpers/get_bucket_size';
import offsetTime from '../../offset_time';
import getIntervalAndTimefield from '../../get_interval_and_timefield';
import { set } from 'lodash';
import { isMetric } from '../../../../../common/metric_types';
import { hasSiblingAggs } from '../../helpers/has_sibling_aggs';
import { getBucketOffset } from '../../helpers/get_bucket_offset';

export default function dateHistogram(req, panel, series) {
  return next => doc => {
    const { timeField, interval } = getIntervalAndTimefield(panel, series);
    const { bucketSize, intervalString } = getBucketSize(req, interval);
    const { from, to }  = offsetTime(req, series.offset_time, panel);

    const offset = getBucketOffset(from.valueOf(), bucketSize * 1000);
    const offsetString = `${Math.floor(offset / 1000)}s`;

    if (isMetric(panel.type) && panel.timerange_mode === 'all') {
      set(doc, `aggs.${series.id}.aggs.timeseries.filters`, { filters: { _all: { match_all: {} } } });
    } else {
      const useTruncatedTimerange = isMetric(panel.type) && !hasSiblingAggs(series);
      const boundsMin = useTruncatedTimerange ? to.clone().subtract(5 * bucketSize, 's') : from;

      set(doc, `aggs.${series.id}.aggs.timeseries.date_histogram`, {
        field: timeField,
        interval: intervalString,
        min_doc_count: 0,
        offset: offsetString,
        extended_bounds: {
          min: boundsMin.valueOf(),
          max: to.valueOf()
        }
      });
    }
    set(doc, `aggs.${series.id}.meta`, {
      to: to.toISOString(),
      from: from.toISOString(),
      timeField,
      intervalString,
      bucketSize,
      offset: offsetString
    });
    return next(doc);
  };
}
