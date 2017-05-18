import Boom from 'boom';
import { getData } from '../lib/get_data';
export default (server) => {

  server.route({
    path: '/api/summarize/data',
    method: 'POST',
    handler: (req, reply) => {
      return getData(req)
        .then(reply)
        .catch(err => {
          reply(Boom.wrap(err, 400));
        });
    }
  });

};


