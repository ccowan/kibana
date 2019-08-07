/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import * as rt from 'io-ts';
import { InfraWrappableRequest } from '../../server/lib/adapters/framework';
import { InfraNodeTypeRT } from './common';

export const InfraApmMetricsRequestRT = rt.type({
  timeRange: rt.type({
    min: rt.number,
    max: rt.number,
  }),
  nodeId: rt.string,
  nodeType: InfraNodeTypeRT,
  sourceId: rt.string,
});

export const InfraApmMetricsTransactionTypeRT = rt.keyof({
  request: null,
  job: null,
});

export const InfraApmMetricsDataPointRT = rt.type({
  timestamp: rt.number,
  value: rt.union([rt.number, rt.null]),
});

export const InfraApmMetricsSeriesRT = rt.type({
  id: rt.string,
  data: rt.array(InfraApmMetricsDataPointRT),
});

export const InfraApmMetricsDataSetRT = rt.type({
  id: rt.string,
  type: InfraApmMetricsTransactionTypeRT,
  series: rt.array(InfraApmMetricsSeriesRT),
});

export const InfraApmMetricsServiceRT = rt.type({
  id: rt.string,
  dataSets: rt.array(InfraApmMetricsDataSetRT),
  agentName: rt.string,
  avgResponseTime: rt.number,
  errorsPerMinute: rt.number,
  transactionsPerMinute: rt.number,
});

export const InfraApmMetricsRT = rt.type({
  id: rt.literal('apmMetrics'),
  services: rt.array(InfraApmMetricsServiceRT),
});

export const APMDataPointRT = rt.type({
  x: rt.number,
  y: rt.union([rt.number, rt.null]),
});

export const APMTpmBucketsRT = rt.type({
  key: rt.string,
  dataPoints: rt.array(APMDataPointRT),
});

export const APMChartResponseRT = rt.type({
  apmTimeseries: rt.intersection([
    rt.type({
      responseTimes: rt.type({
        avg: rt.array(APMDataPointRT),
        p95: rt.array(APMDataPointRT),
        p99: rt.array(APMDataPointRT),
      }),
      tpmBuckets: rt.array(APMTpmBucketsRT),
    }),
    rt.partial({
      overallAvgDuration: rt.union([rt.number, rt.null]),
    }),
  ]),
});

export const APMServiceResponseRT = rt.type({
  hasHistoricalData: rt.boolean,
  hasLegacyData: rt.boolean,
  items: rt.array(
    rt.type({
      agentName: rt.string,
      avgResponseTime: rt.number,
      environments: rt.array(rt.string),
      errorsPerMinute: rt.number,
      serviceName: rt.string,
      transactionsPerMinute: rt.number,
    })
  ),
});

export type InfraApmMetricsRequest = rt.TypeOf<typeof InfraApmMetricsRequestRT>;

export type InfraApmMetricsRequestWrapped = InfraWrappableRequest<InfraApmMetricsRequest>;

export type InfraApmMetrics = rt.TypeOf<typeof InfraApmMetricsRT>;

export type InfraApmMetricsService = rt.TypeOf<typeof InfraApmMetricsServiceRT>;

export type InfraApmMetricsSeries = rt.TypeOf<typeof InfraApmMetricsSeriesRT>;

export type InfraApmMetricsDataPoint = rt.TypeOf<typeof InfraApmMetricsDataPointRT>;

export type InfraApmMetricsTransactionType = rt.TypeOf<typeof InfraApmMetricsTransactionTypeRT>;

export type InfraApmMetricsDataSet = rt.TypeOf<typeof InfraApmMetricsDataSetRT>;

export type APMDataPoint = rt.TypeOf<typeof APMDataPointRT>;

export type APMTpmBuckets = rt.TypeOf<typeof APMTpmBucketsRT>;

export type APMChartResponse = rt.TypeOf<typeof APMChartResponseRT>;
