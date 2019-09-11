/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import moment from 'moment';
import Boom from 'boom';
import { Legacy } from 'kibana';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Either';
import { identity } from 'fp-ts/lib/function';
import { throwErrors } from '../../../../common/runtime_types';
import { APMServiceResponseRT, InfraApmMetricsService } from '../../../../common/http_api';
import { InfraNodeType } from '../../../../common/http_api/common';
import {
  InfraBackendFrameworkAdapter,
  InfraFrameworkRequest,
} from '../../../lib/adapters/framework';
import { InfraSourceConfiguration } from '../../../lib/sources';
import { getApmFieldName } from '../../../../common/utils/get_apm_field_name';

export const getApmServices = async (
  framework: InfraBackendFrameworkAdapter,
  req: InfraFrameworkRequest,
  sourceConfiguration: InfraSourceConfiguration,
  nodeId: string,
  nodeType: InfraNodeType,
  timeRange: { min: number; max: number }
): Promise<InfraApmMetricsService[]> => {
  const nodeField = getApmFieldName(sourceConfiguration, nodeType);
  const params = new URLSearchParams({
    start: moment(timeRange.min).toISOString(),
    end: moment(timeRange.max).toISOString(),
    uiFilters: JSON.stringify({ kuery: `${nodeField}: "${nodeId}"` }),
  });
  const res = await framework.makeInternalRequest(
    req as InfraFrameworkRequest<Legacy.Request>,
    `/api/apm/services?${params.toString()}`,
    'GET'
  );
  if (res.statusCode !== 200) {
    throw res;
  }
  const result = pipe(
    APMServiceResponseRT.decode(res.result),
    fold(
      throwErrors(message => Boom.badImplementation(`Request to APM Failed: ${message}`)),
      identity
    )
  );
  return result.items.map(item => ({
    id: item.serviceName,
    dataSets: [],
    avgResponseTime: item.avgResponseTime,
    agentName: item.agentName,
    errorsPerMinute: item.errorsPerMinute,
    transactionsPerMinute: item.transactionsPerMinute,
  }));
};
