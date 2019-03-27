/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InfraSourceResolvers } from '../../graphql/types';
import { InfraMetricsDomain } from '../../lib/domains/metrics_domain';
import { ChildResolverOf, InfraResolverOf } from '../../utils/typed_resolvers';
import { QuerySourceResolver } from '../sources/resolvers';

type InfraSourceMetricsExplorerResolver = ChildResolverOf<
  InfraResolverOf<InfraSourceResolvers.MetricsExplorerResolver>,
  QuerySourceResolver
>;

interface ResolverDeps {
  metrics: InfraMetricsDomain;
}

export const createMetricsExplorerResolvers = (
  libs: ResolverDeps
): {
  InfraSource: {
    metricsExplorer: InfraSourceMetricsExplorerResolver;
  };
} => ({
  InfraSource: {
    async metricsExplorer(source, args, { req }) {
      const options = {
        timerange: args.timerange,
        metrics: args.metrics,
        filterQuery: args.filterQuery,
        groupBy: args.groupBy || null,
        limit: args.limit || 10,
        afterKey: args.afterKey,
        sourceConfiguration: source.configuration,
      };
      return libs.metrics.getCustomMetrics(req, options);
    },
  },
});
