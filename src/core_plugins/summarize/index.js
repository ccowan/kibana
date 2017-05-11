import fieldsAPI from './server/routes/fields';
import previewAPI from './server/routes/preview';
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
        enabled: Joi.boolean().default(true)
      }).default();
    },


    init(server) {
      fieldsAPI(server);
      previewAPI(server);
    }


  });
}
