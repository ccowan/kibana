/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InfraMetricModel, InfraMetricModelMetricType } from '../../../lib/adapters/metrics';
import { MetricsExplorerAggregation, MetricsExplorerRequest } from '../types';
export const createMetricModel = (options: MetricsExplorerRequest): InfraMetricModel => {
  return {
    id: 'custom',
    requires: [],
    index_pattern: options.indexPattern,
    interval: options.timerange.interval,
    time_field: options.timerange.field,
    type: 'timeseries',
    // Create one series per metric requested. The series.id will be used to identify the metric
    // when the responses are processed and combined with the grouping request.
    series: options.metrics.map((metric, index) => {
      // If the metric is a rate then we need to add TSVB metrics for calculating the derivative
      if (metric.aggregation === MetricsExplorerAggregation.rate) {
        return {
          id: `metric_${index}`,
          split_mode: 'everything',
          metrics: [
            {
              id: `metric_max_${index}`,
              field: metric.field,
              type: InfraMetricModelMetricType.max,
            },
            {
              id: `metric_deriv_max_${index}`,
              field: `metric_max_${index}`,
              type: InfraMetricModelMetricType.derivative,
              unit: '1s',
            },
            {
              id: `metric_posonly_deriv_max_${index}`,
              type: InfraMetricModelMetricType.calculation,
              variables: [{ id: 'var-rate', name: 'rate', field: `metric_deriv_max_${index}` }],
              script: 'params.rate > 0.0 ? params.rate : 0.0',
            },
          ],
        };
      }
      // Create a basic TSVB series with a single metric
      const aggregation =
        MetricsExplorerAggregation[metric.aggregation] || MetricsExplorerAggregation.avg;

      return {
        id: `metric_${index}`,
        split_mode: 'everything',
        metrics: [
          {
            field: metric.field,
            id: `metric_${aggregation}_${index}`,
            type: InfraMetricModelMetricType[aggregation],
          },
        ],
      };
    }),
  };
};
