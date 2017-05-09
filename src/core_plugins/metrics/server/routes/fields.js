import getFields from '../lib/get_fields';
export default (server) => {

  server.route({
    path: '/api/metrics/fields',
    method: 'GET',
    handler: (req, reply) => {
      return getFields(req)
        .then(reply)
        .catch((err) => {
          if (err.isBoom && err.status === 401) return reply(err);
          reply([]);
        });
    }
  });

};

