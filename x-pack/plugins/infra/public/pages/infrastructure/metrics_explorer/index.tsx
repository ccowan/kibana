/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InjectedIntl, injectI18n } from '@kbn/i18n/react';
import React, { useCallback, useContext, useState } from 'react';
import { StaticIndexPattern } from 'ui/index_patterns';
import { SourceFields } from '../../../../common/graphql/types';
import {
  MetricsExplorerMetric,
  MetricsExplorerAggregation,
} from '../../../../server/routes/metrics_explorer/types';
import { DocumentTitle } from '../../../components/document_title';
import { MetricsExplorerCharts } from '../../../components/metrics_exploerer/charts';
import { MetricsExplorerToolbar } from '../../../components/metrics_exploerer/toolbar';
import { useMetricsExplorerData } from '../../../containers/metrics_explorer/use_metrics_explorer_data';
import { MetricsExplorerOptionsContainer } from '../../../containers/metrics_explorer/use_metrics_explorer_options';

interface MetricsExplorerPageProps {
  intl: InjectedIntl;
  source: SourceFields.Configuration | undefined;
  derivedIndexPattern: StaticIndexPattern;
}

export const MetricsExplorerPage = injectI18n(
  ({ intl, source, derivedIndexPattern }: MetricsExplorerPageProps) => {
    if (!source) {
      return null;
    }

    const [refreshSignal, setRefreshSignal] = useState(0);
    const { options, currentTimerange, setTimeRange, setOptions } = useContext(
      MetricsExplorerOptionsContainer.Context
    );
    const { loading, error, data } = useMetricsExplorerData(
      options,
      source,
      derivedIndexPattern,
      currentTimerange,
      refreshSignal
    );

    const handleRefresh = useCallback(
      () => {
        setRefreshSignal(refreshSignal + 1);
      },
      [refreshSignal]
    );

    const handleTimeChange = useCallback(
      (start: string, end: string) => {
        setOptions({ ...options, afterKey: null });
        setTimeRange({ ...currentTimerange, from: start, to: end });
      },
      [options, currentTimerange]
    );

    const handleGroupByChange = useCallback(
      (groupBy: string | null) => {
        setOptions({
          ...options,
          groupBy: groupBy || void 0,
        });
      },
      [options]
    );

    const handleFilterQuerySubmit = useCallback(
      (query: string) => {
        setOptions({
          ...options,
          filterQuery: query,
        });
      },
      [options]
    );

    const handleMetricsChange = useCallback(
      (metrics: MetricsExplorerMetric[]) => {
        setOptions({
          ...options,
          afterKey: null, // since we are changing the metrics we need to reset the pagination
          metrics,
        });
      },
      [options]
    );

    const handleLoadMore = useCallback(
      (afterKey: string | null) => setOptions({ ...options, afterKey }),
      [options]
    );

    const handleAggregationChange = useCallback(
      (aggregation: MetricsExplorerAggregation) => {
        setOptions({
          ...options,
          aggregation,
          metrics: options.metrics.map(metric => ({
            ...metric,
            aggregation:
              aggregation === MetricsExplorerAggregation.count ? metric.aggregation : aggregation,
          })),
        });
      },
      [options]
    );

    return (
      <div>
        <DocumentTitle
          title={(previousTitle: string) =>
            intl.formatMessage(
              {
                id: 'xpack.infra.infrastructureMetricsExplorerPage.documentTitle',
                defaultMessage: '{previousTitle} | Metrics explorer',
              },
              {
                previousTitle,
              }
            )
          }
        />
        <MetricsExplorerToolbar
          source={source}
          derivedIndexPattern={derivedIndexPattern}
          currentTimerange={currentTimerange}
          options={options}
          onRefresh={handleRefresh}
          onTimeChange={handleTimeChange}
          onGroupByChange={handleGroupByChange}
          onFilterQuerySubmit={handleFilterQuerySubmit}
          onMetricsChange={handleMetricsChange}
          onAggregationChange={handleAggregationChange}
        />
        {(error && error.message) || (
          <MetricsExplorerCharts
            loading={loading}
            data={data}
            options={options}
            onLoadMore={handleLoadMore}
            onRefetch={handleRefresh}
          />
        )}
      </div>
    );
  }
);
