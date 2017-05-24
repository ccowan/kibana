import fieldsAPI from './server/routes/fields';
import previewAPI from './server/routes/preview';
import dataAPI from './server/routes/data';
import { createClient } from './server/lib/create_client';
import { processVisualizations } from './server/lib/process_visualizations';
export default function (kibana) {
  return new kibana.Plugin({
    require: ['kibana','elasticsearch'],

    uiExports: {
      visTypes: [
        'plugins/summarize/kbn_vis_types'
      ]
    },

    config(Joi) {
      const DEFAULT_REQUEST_HEADERS = [ 'authorization' ];
      return Joi.object({
        enabled: Joi.boolean().default(true),
        indexing: Joi.boolean().default(true),
        logTags: Joi.array().items(Joi.string()).default(['summarize']),
        logQueries: Joi.boolean().default(false),
        queue: Joi.object({
          index: Joi.string().default('summarize-queue'),
          checkInterval: Joi.number().default(10000),
          jobTimeout: Joi.number().default(10000),
          startWorkers: Joi.boolean().default(true),
          startWatcher: Joi.boolean().default(true),
        }).default(),
        elasticsearch: Joi.object({
          customHeaders: Joi.object().default({}),
          logQueries: Joi.boolean().default(false),
          requestHeadersWhitelist: Joi.array().items().single().default(DEFAULT_REQUEST_HEADERS),
          url: Joi.string().uri({ scheme: ['http', 'https'] }), // if empty, use Kibana's connection config
          username: Joi.string(),
          password: Joi.string(),
          requestTimeout: Joi.number().default(30000),
          pingTimeout: Joi.number().default(30000),
          ssl: Joi.object({
            verificationMode: Joi.string().valid('none', 'certificate', 'full').default('full'),
            certificateAuthorities: Joi.array().single().items(Joi.string()),
            certificate: Joi.string(),
            key: Joi.string(),
            keyPassphrase: Joi.string()
          }).default(),
          apiVersion: Joi.string().default('master'),
          engineVersion: Joi.string().valid('^6.0.0').default('^6.0.0')
        }).default()
      }).default();
    },


    init(server) {
      const config = server.config();
      fieldsAPI(server);
      previewAPI(server);
      dataAPI(server);
      createClient(server);
      if (config.get('summarize.indexing')) {
        processVisualizations(this, server);
      }
    }


  });
}
