/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { ApolloError } from 'apollo-client';
import React from 'react';
import { Query } from 'react-apollo';
import {
  InfraMetric,
  InfraMetricData,
  InfraNodeType,
  MetricsQuery,
  InfraTimerangeInput,
} from '../../graphql/types';
import { InfraMetricLayout } from '../../pages/metrics/layouts/types';
import { metricsQuery } from './metrics.gql_query';
import { useApmMetrics } from './use_apm_metrics';
import { InfraApmMetrics } from '../../../common/http_api';
import { KFetchError } from '../../../../../../../src/legacy/ui/public/kfetch/kfetch_error';

interface WithMetricsArgs {
  metrics: InfraMetricCombinedData[];
  error?: KFetchError | ApolloError | undefined;
  loading: boolean;
  refetch: () => void;
}

interface WithMetricsProps {
  children: (args: WithMetricsArgs) => React.ReactNode;
  layouts: InfraMetricLayout[];
  nodeType: InfraNodeType;
  nodeId: string;
  cloudId: string;
  sourceId: string;
  timerange: InfraTimerangeInput;
}

export type InfraMetricCombinedData = InfraMetricData | InfraApmMetrics;

export const WithMetrics = ({
  children,
  layouts,
  sourceId,
  timerange,
  nodeType,
  nodeId,
  cloudId,
}: WithMetricsProps) => {
  const metrics = layouts.reduce(
    (acc, item) => {
      return acc.concat(item.sections.map(s => s.id));
    },
    [] as InfraMetric[]
  );

  // only make this request if apmMetrics is included in the list
  // of metrics from the filtered layout.
  const apmMetrics = metrics.includes(InfraMetric.apmMetrics)
    ? useApmMetrics(sourceId, nodeId, nodeType, timerange)
    : {
        metrics: null,
        loading: false,
        error: undefined,
        makeRequest: () => void 0,
      };

  return (
    <Query<MetricsQuery.Query, MetricsQuery.Variables>
      query={metricsQuery}
      fetchPolicy="no-cache"
      notifyOnNetworkStatusChange
      variables={{
        sourceId,
        // Need to filter out the apmMetrics id since that is being handled
        // by the useApmMetrics hook. This could have been added to the GraphQL
        // endpoint but would have required signifigant overhead with managing
        // the types due to the shape of the APM metric data
        metrics: metrics.filter(m => m !== InfraMetric.apmMetrics),
        nodeType,
        nodeId,
        cloudId,
        timerange,
      }}
    >
      {({ data, error, loading, refetch }) => {
        return children({
          metrics: [
            ...filterOnlyInfraMetricData(data && data.source && data.source.metrics),
            ...(apmMetrics.metrics ? [apmMetrics.metrics] : []),
          ],
          error: error || apmMetrics.error,
          loading: loading && apmMetrics.loading,
          refetch: () => {
            refetch();
            apmMetrics.makeRequest();
          },
        });
      }}
    </Query>
  );
};

const filterOnlyInfraMetricData = (
  metrics: Array<MetricsQuery.Metrics | null> | undefined
): InfraMetricData[] => {
  if (!metrics) {
    return [];
  }
  return metrics.filter(m => m !== null).map(m => m as InfraMetricData);
};
