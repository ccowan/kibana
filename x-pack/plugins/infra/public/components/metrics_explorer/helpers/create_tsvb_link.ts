/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { encode } from 'rison-node';
import uuid from 'uuid';
import { StaticIndexPattern } from 'ui/index_patterns';
import { colorTransformer, MetricsExplorerColor } from '../../../../common/color_palette';
import {
  MetricsExplorerSeries,
  MetricsExplorerAggregation,
} from '../../../../server/routes/metrics_explorer/types';
import {
  MetricsExplorerOptions,
  MetricsExplorerOptionsMetric,
  MetricsExplorerTimeOptions,
} from '../../../containers/metrics_explorer/use_metrics_explorer_options';
import { metricToFormat } from './metric_to_format';
import { InfraFormatterType } from '../../../lib/lib';
import { SourceQuery } from '../../../graphql/types';
import { createMetricLabel } from './create_metric_label';
// import { convertKueryToElasticSearchQuery } from '../../../utils/kuery';

export const metricsExplorerMetricToTSVBMetric = (metric: MetricsExplorerOptionsMetric) => {
  if (metric.aggregation === MetricsExplorerAggregation.rate) {
    const metricId = uuid.v1();
    const positiveOnlyId = uuid.v1();
    const derivativeId = uuid.v1();
    return [
      {
        id: metricId,
        type: 'max',
        field: metric.field || void 0,
      },
      {
        id: derivativeId,
        type: 'derivative',
        field: metricId,
        unit: '1s',
      },
      {
        id: positiveOnlyId,
        type: 'positive_only',
        field: derivativeId,
      },
    ];
  } else {
    return [
      {
        id: uuid.v1(),
        type: metric.aggregation,
        field: metric.field || void 0,
      },
    ];
  }
};

const mapMetricToSeries = (metric: MetricsExplorerOptionsMetric) => {
  const format = metricToFormat(metric);
  return {
    label: createMetricLabel(metric),
    axis_position: 'right',
    chart_type: 'line',
    color: encodeURIComponent(
      (metric.color && colorTransformer(metric.color)) ||
        colorTransformer(MetricsExplorerColor.color0)
    ),
    fill: 0,
    formatter: format === InfraFormatterType.bits ? InfraFormatterType.bytes : format,
    value_template:
      MetricsExplorerAggregation.rate === metric.aggregation ? '{{value}}/s' : '{{value}}',
    id: uuid.v1(),
    line_width: 2,
    metrics: metricsExplorerMetricToTSVBMetric(metric),
    point_size: 0,
    separate_axis: 0,
    split_mode: 'everything',
    stacked: 'none',
  };
};

const createFilterFromOptions = (
  options: MetricsExplorerOptions,
  series: MetricsExplorerSeries
) => {
  const filters = [];
  if (options.filterQuery) {
    filters.push(options.filterQuery);
  }
  if (options.groupBy) {
    filters.push(`${options.groupBy} : "${series.id}"`);
  }
  return { language: 'kuery', query: filters.join(' and ') };
};

export const createTSVBLink = (
  source: SourceQuery.Query['source']['configuration'] | undefined,
  options: MetricsExplorerOptions,
  series: MetricsExplorerSeries,
  timeRange: MetricsExplorerTimeOptions,
  derivedIndexPattern: StaticIndexPattern
) => {
  const appState = {
    filters: [],
    linked: false,
    query: { language: 'kuery', query: '' },
    uiState: {},
    vis: {
      aggs: [],
      params: {
        axis_formatter: 'number',
        axis_position: 'left',
        axis_scale: 'normal',
        id: uuid.v1(),
        default_index_pattern: (source && source.metricAlias) || 'metricbeat-*',
        index_pattern: (source && source.metricAlias) || 'metricbeat-*',
        interval: 'auto',
        series: options.metrics.map(mapMetricToSeries),
        show_grid: 1,
        show_legend: 1,
        time_field: (source && source.fields.timestamp) || '@timestamp',
        type: 'timeseries',
        filter: createFilterFromOptions(options, series),
      },
      title: series.id,
      type: 'metrics',
    },
  };

  const globalState = {
    refreshInterval: { pause: true, value: 0 },
    time: { from: timeRange.from, to: timeRange.to },
  };

  return `../app/kibana#/visualize/create?type=metrics&_g=${encode(globalState)}&_a=${encode(
    appState as any
  )}`;
};
