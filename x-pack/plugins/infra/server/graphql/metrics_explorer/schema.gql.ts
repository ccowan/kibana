/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import gql from 'graphql-tag';

export const metricsExplorerSchema: any = gql`
  input InfraMetricsExplorerMetricInput {
    field: String!
    aggregation: String!
    rate: Boolean!
  }

  type InfraMetricsExporerColumn {
    name: String!
    type: String!
  }

  type InfraMetricsExplorerString {
    key: ID!
    stringValue: String
  }

  type InfraMetricsExplorerFloat {
    key: ID!
    floatValue: Float
  }

  union InfraMetricsExplorerValue = InfraMetricsExplorerString | InfraMetricsExplorerFloat

  type InfraMetricsExplorerRow {
    values: [InfraMetricsExplorerValue!]!
  }

  type InfraMetricsExplorerSeries {
    id: String!
    columns: [InfraMetricsExporerColumn]
    rows: [InfraMetricsExplorerRow]
  }

  type InfraMetricsExplorerPageInfo {
    total: Int!
    afterKey: String
    hasMore: Boolean
  }

  type InfraMetricsExplorerResponse {
    series: [InfraMetricsExplorerSeries]!
    pageInfo: InfraMetricsExplorerPageInfo!
  }

  extend type InfraSource {
    "Service for the Metrics Explorer"
    metricsExplorer(
      timerange: InfraTimerangeInput!
      filterQuery: String
      groupBy: String
      metrics: [InfraMetricsExplorerMetricInput!]!
      limit: Int
      afterKey: ID
    ): InfraMetricsExplorerResponse!
  }
`;
