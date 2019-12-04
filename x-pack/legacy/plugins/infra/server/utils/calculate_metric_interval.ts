/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InfraBackendFrameworkAdapter, InfraFrameworkRequest } from '../lib/adapters/framework';
import { InfraNodeType } from '../graphql/types';
import { findInventoryModel } from '../../common/inventory_models';

interface Options {
  indexPattern: string;
  timestampField: string;
  timerange: {
    from: number;
    to: number;
  };
}

/**
 * Look at the data from metricbeat and get the max period for a given timerange.
 * This is useful for visualizing metric modules like s3 that only send metrics once per day.
 */
export const calculateMetricInterval = async (
  framework: InfraBackendFrameworkAdapter,
  request: InfraFrameworkRequest,
  options: Options,
  modules: string[],
  nodeType?: InfraNodeType
) => {
  let from = options.timerange.from;
  if (nodeType) {
    const inventoryModel = findInventoryModel(nodeType);
    from = options.timerange.to - inventoryModel.metrics.defaultTimeRangeInSeconds * 1000;
  }
  const query = {
    allowNoIndices: true,
    index: options.indexPattern,
    ignoreUnavailable: true,
    body: {
      query: {
        bool: {
          filter: [
            {
              range: {
                [options.timestampField]: {
                  gte: from,
                  lte: options.timerange.to,
                  format: 'epoch_millis',
                },
              },
            },
          ],
        },
      },
      size: 0,
      aggs: {
        modules: {
          terms: {
            field: 'event.dataset',
            include: modules,
          },
          aggs: {
            period: {
              max: {
                field: 'metricset.period',
              },
            },
          },
        },
      },
    },
  };

  const resp = await framework.callWithRequest<{}, PeriodAggregationData>(request, 'search', query);

  // if ES doesn't return an aggregations key, something went seriously wrong.
  if (!resp.aggregations) {
    return 60000;
  }

  const intervals = resp.aggregations.modules.buckets.map(a => a.period.value).filter(v => !!v);
  if (!intervals.length) {
    return 60000;
  }

  return Math.max(...intervals) / 1000;
};

interface PeriodAggregationData {
  modules: {
    buckets: Array<{
      key: string;
      doc_count: number;
      period: {
        value: number;
      };
    }>;
  };
}
