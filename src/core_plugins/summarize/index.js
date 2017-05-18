import fieldsAPI from './server/routes/fields';
import previewAPI from './server/routes/preview';
import dataAPI from './server/routes/data';
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
      return Joi.object({
        enabled: Joi.boolean().default(true),
        indexing: Joi.boolean().default(true),
        checkInterval: Joi.number().default(10000)
      }).default();
    },


    init(server) {
      const config = server.config();
      fieldsAPI(server);
      previewAPI(server);
      dataAPI(server);
      if (config.get('summarize.indexing')) {
        processVisualizations(server);
      }
    }


  });
}
