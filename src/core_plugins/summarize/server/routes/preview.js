import Boom from 'boom';
import { getPreviewData } from '../lib/get_preview_data';
export default (server) => {

  server.route({
    path: '/api/summarize/preview',
    method: 'POST',
    handler: (req, reply) => {
      return getPreviewData(req)
        .then(reply)
        .catch(err => {
          console.log(err.stack);
          reply(Boom.wrap(err, 400));
        });
    }
  });

};

