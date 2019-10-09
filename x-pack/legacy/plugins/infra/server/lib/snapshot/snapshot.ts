/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { set } from 'lodash';
import {
  InfraSnapshotGroupbyInput,
  InfraSnapshotMetricInput,
  InfraSnapshotNode,
  InfraTimerangeInput,
  InfraNodeType,
  InfraSourceConfiguration,
} from '../../graphql/types';
import {
  InfraBackendFrameworkAdapter,
  InfraFrameworkRequest,
  InfraDatabaseSearchResponse,
} from '../adapters/framework';
import { InfraSources } from '../sources';

import { JsonObject } from '../../../common/typed_json';
import { SNAPSHOT_COMPOSITE_REQUEST_SIZE } from './constants';
import {
  getGroupedNodesSources,
  getMetricsAggregations,
  getMetricsSources,
  getDateHistogramOffset,
} from './query_helpers';
import {
  getNodeMetrics,
  getNodeMetricsForLookup,
  getNodePath,
  InfraSnapshotNodeGroupByBucket,
  InfraSnapshotNodeMetricsBucket,
} from './response_helpers';
import { IP_FIELDS } from '../constants';
import { getAllCompositeData } from '../../utils/get_all_composite_data';

export interface InfraSnapshotRequestOptions {
  nodeType: InfraNodeType;
  sourceConfiguration: InfraSourceConfiguration;
  timerange: InfraTimerangeInput;
  groupBy: InfraSnapshotGroupbyInput[];
  metric: InfraSnapshotMetricInput;
  filterQuery: JsonObject | undefined;
}

export class InfraSnapshot {
  constructor(
    private readonly libs: { sources: InfraSources; framework: InfraBackendFrameworkAdapter }
  ) {}

  public async getNodes(
    request: InfraFrameworkRequest,
    options: InfraSnapshotRequestOptions
  ): Promise<InfraSnapshotNode[]> {
    // Both requestGroupedNodes and requestNodeMetrics may send several requests to elasticsearch
    // in order to page through the results of their respective composite aggregations.
    // Both chains of requests are supposed to run in parallel, and their results be merged
    // when they have both been completed.
    const groupedNodesPromise = requestGroupedNodes(request, options, this.libs.framework);
    const nodeMetricsPromise = requestNodeMetrics(request, options, this.libs.framework);

    const groupedNodeBuckets = await groupedNodesPromise;
    const nodeMetricBuckets = await nodeMetricsPromise;
    return mergeNodeBuckets(groupedNodeBuckets, nodeMetricBuckets, options);
  }
}

// This is used by the getAllCompositeData to select the bucket to return.
const bucketSelector = (
  response: InfraDatabaseSearchResponse<{}, InfraSnapshotAggregationResponse>
) => (response.aggregations && response.aggregations.nodes.buckets) || [];

// This is used by getAllCompositeData to add the after key to the subsequent requests
const handleAfterKey = (
  options: object,
  response: InfraDatabaseSearchResponse<{}, InfraSnapshotAggregationResponse>
) => {
  if (!response.aggregations) {
    return options;
  }
  const newOptions = { ...options };
  set(newOptions, 'body.aggregations.nodes.composite.after', response.aggregations.nodes.after_key);
  return newOptions;
};

const requestGroupedNodes = async (
  request: InfraFrameworkRequest,
  options: InfraSnapshotRequestOptions,
  framework: InfraBackendFrameworkAdapter
): Promise<InfraSnapshotNodeGroupByBucket[]> => {
  const query = {
    allowNoIndices: true,
    index: `${options.sourceConfiguration.logAlias},${options.sourceConfiguration.metricAlias}`,
    ignoreUnavailable: true,
    body: {
      query: {
        bool: {
          filter: [
            ...createQueryFilterClauses(options.filterQuery),
            {
              range: {
                [options.sourceConfiguration.fields.timestamp]: {
                  gte: options.timerange.from,
                  lte: options.timerange.to,
                  format: 'epoch_millis',
                },
              },
            },
          ],
        },
      },
      size: 0,
      aggregations: {
        nodes: {
          composite: {
            size: SNAPSHOT_COMPOSITE_REQUEST_SIZE,
            sources: getGroupedNodesSources(options),
          },
          aggs: {
            ip: {
              top_hits: {
                sort: [{ [options.sourceConfiguration.fields.timestamp]: { order: 'desc' } }],
                _source: {
                  includes: [IP_FIELDS[options.nodeType]],
                },
                size: 1,
              },
            },
          },
        },
      },
    },
  };

  return await getAllCompositeData<
    InfraSnapshotAggregationResponse,
    InfraSnapshotNodeGroupByBucket
  >(framework, request, query, bucketSelector, handleAfterKey);
};

const requestNodeMetrics = async (
  request: InfraFrameworkRequest,
  options: InfraSnapshotRequestOptions,
  framework: InfraBackendFrameworkAdapter
): Promise<InfraSnapshotNodeMetricsBucket[]> => {
  const index =
    options.metric.type === 'logRate'
      ? `${options.sourceConfiguration.logAlias}`
      : `${options.sourceConfiguration.metricAlias}`;

  const query = {
    allowNoIndices: true,
    index,
    ignoreUnavailable: true,
    body: {
      query: {
        bool: {
          filter: [
            {
              range: {
                [options.sourceConfiguration.fields.timestamp]: {
                  gte: options.timerange.from,
                  lte: options.timerange.to,
                  format: 'epoch_millis',
                },
              },
            },
          ],
        },
      },
      size: 0,
      aggregations: {
        nodes: {
          composite: {
            size: SNAPSHOT_COMPOSITE_REQUEST_SIZE,
            sources: getMetricsSources(options),
          },
          aggregations: {
            histogram: {
              date_histogram: {
                field: options.sourceConfiguration.fields.timestamp,
                interval: options.timerange.interval || '1m',
                offset: getDateHistogramOffset(options),
                extended_bounds: {
                  min: options.timerange.from,
                  max: options.timerange.to,
                },
              },
              aggregations: getMetricsAggregations(options),
            },
          },
        },
      },
    },
  };
  return await getAllCompositeData<
    InfraSnapshotAggregationResponse,
    InfraSnapshotNodeMetricsBucket
  >(framework, request, query, bucketSelector, handleAfterKey);
};

// buckets can be InfraSnapshotNodeGroupByBucket[] or InfraSnapshotNodeMetricsBucket[]
// but typing this in a way that makes TypeScript happy is unreadable (if possible at all)
interface InfraSnapshotAggregationResponse {
  nodes: {
    buckets: any[];
    after_key: { [id: string]: string };
  };
}

const mergeNodeBuckets = (
  nodeGroupByBuckets: InfraSnapshotNodeGroupByBucket[],
  nodeMetricsBuckets: InfraSnapshotNodeMetricsBucket[],
  options: InfraSnapshotRequestOptions
): InfraSnapshotNode[] => {
  const nodeMetricsForLookup = getNodeMetricsForLookup(nodeMetricsBuckets);

  return nodeGroupByBuckets.map(node => {
    return {
      path: getNodePath(node, options),
      metric: getNodeMetrics(nodeMetricsForLookup[node.key.id], options),
    };
  });
};

const createQueryFilterClauses = (filterQuery: JsonObject | undefined) =>
  filterQuery ? [filterQuery] : [];
