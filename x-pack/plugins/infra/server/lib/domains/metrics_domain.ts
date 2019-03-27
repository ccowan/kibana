/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InfraMetricData, InfraMetricsExplorerResponse } from '../../graphql/types';
import { InfraFrameworkRequest } from '../adapters/framework/adapter_types';
import {
  InfraMetricsAdapter,
  InfraMetricsExplorerRequestOptions,
  InfraMetricsRequestOptions,
} from '../adapters/metrics/adapter_types';

export class InfraMetricsDomain {
  private adapter: InfraMetricsAdapter;

  constructor(adapter: InfraMetricsAdapter) {
    this.adapter = adapter;
  }

  public async getMetrics(
    req: InfraFrameworkRequest,
    options: InfraMetricsRequestOptions
  ): Promise<InfraMetricData[]> {
    return await this.adapter.getMetrics(req, options);
  }

  public async getCustomMetrics(
    req: InfraFrameworkRequest,
    options: InfraMetricsExplorerRequestOptions
  ): Promise<InfraMetricsExplorerResponse> {
    return await this.adapter.getCustomMetrics(req, options);
  }
}
