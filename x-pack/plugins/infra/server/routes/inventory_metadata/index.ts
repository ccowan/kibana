/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { schema } from '@kbn/config-schema';
import Boom from '@hapi/boom';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Either';
import { identity } from 'fp-ts/lib/function';
import { findInventoryModel } from '../../../common/inventory_models';
import { InfraBackendLibs } from '../../lib/infra_types';
import { throwErrors } from '../../../common/runtime_types';

import {
  InventoryMetaRequestRT,
  InventoryMetaResponseRT,
} from '../../../common/http_api/inventory_meta_api';
import { getCloudMetadata } from './lib/get_cloud_metadata';

const escapeHatch = schema.object({}, { unknowns: 'allow' });

export const initInventoryMetaRoute = (libs: InfraBackendLibs) => {
  const { framework } = libs;

  framework.registerRoute(
    {
      method: 'post',
      path: '/api/infra/inventory/meta',
      validate: {
        body: escapeHatch,
      },
    },
    async (requestContext, request, response) => {
      try {
        const { sourceId, nodeType, currentTime } = pipe(
          InventoryMetaRequestRT.decode(request.body),
          fold(throwErrors(Boom.badRequest), identity)
        );

        const model = findInventoryModel(nodeType);

        // Only run this for AWS modules, eventually we might have more.
        if (model.requiredModule !== 'aws') {
          return response.ok({
            body: {
              accounts: [],
              projects: [],
              regions: [],
            },
          });
        }

        const { configuration } = await libs.sources.getSourceConfiguration(
          requestContext.core.savedObjects.client,
          sourceId
        );

        const awsMetadata = await getCloudMetadata(
          framework,
          requestContext,
          configuration,
          nodeType,
          currentTime
        );

        return response.ok({
          body: InventoryMetaResponseRT.encode(awsMetadata),
        });
      } catch (error) {
        return response.internalError({
          body: error.message,
        });
      }
    }
  );
};
