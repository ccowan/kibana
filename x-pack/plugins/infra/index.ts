/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Server } from 'hapi';
import JoiNamespace from 'joi';
import { resolve } from 'path';

import { getConfigSchema, initServerWithKibana } from './server/kibana.index';

const APP_ID = 'infra';

export function infra(kibana: any) {
  return new kibana.Plugin({
    id: APP_ID,
    configPrefix: 'xpack.infra',
    publicDir: resolve(__dirname, 'public'),
    require: ['kibana', 'elasticsearch'],
    uiExports: {
      app: {
        description: 'Explore your infrastructure',
        icon: 'plugins/infra/images/infra_mono_white.svg',
        main: 'plugins/infra/app',
        title: 'InfraOps',
        listed: false,
        url: `/app/${APP_ID}#/home`,
      },
      links: [
        {
          description: 'Explore your infrastructure',
          icon: 'plugins/infra/images/infra_mono_white.svg',
          id: 'infra:home',
          order: 8000,
          title: 'InfraOps',
          url: `/app/${APP_ID}#/home`,
        },
        {
          description: 'Explore your logs',
          icon: 'plugins/infra/images/logging_mono_white.svg',
          id: 'infra:logs',
          order: 8001,
          title: 'Logs',
          url: `/app/${APP_ID}#/logs`,
        },
      ],
    },
    config(Joi: typeof JoiNamespace) {
      return getConfigSchema(Joi);
    },
    init(plugin: Server) {
      initServerWithKibana(plugin);
    },
  });
}
