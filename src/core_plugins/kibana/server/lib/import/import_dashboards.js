import _ from 'lodash';

const acceptableTypes = [
  'search',
  'dashboard',
  'visualization',
  'index-pattern'
];

export default function importDashboards(req) {
  const { payload } = req;
  const config = req.server.config();
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('admin');
  const index = config.get('kibana.index');
  const force = req.query.force && _.includes([1, true, 'true', '1'], req.query.force);
  const action = force ? 'index' : 'create';
  const exclude = _.flatten([req.query.exclude]);


  if (payload.version !== config.get('pkg.version')) {
    return Promise.reject(new Error(`Version ${payload.version} does not match ${config.get('pkg.version')}.`));
  }

  const body = payload.objects
    .filter(item => !_.includes(exclude, item._type))
    .reduce((acc, item) => {
      if (_.includes(acceptableTypes, item._type)) {
        acc.push({ [action]: { _index: index, _type: item._type, _id: item._id } });
        acc.push(item._source);
      }
      return acc;
    }, []);

  return callWithRequest(req, 'bulk', { body });

}
