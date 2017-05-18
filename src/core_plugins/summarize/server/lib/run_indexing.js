import { getAllHosts } from './get_all_hosts';
import moment from 'moment';
import _ from 'lodash';
import Promise from 'bluebird';
import { getColumnData } from './preview/get_column_data';
export function runIndexing(server, doc) {
  return getAllHosts(server, doc).then(hosts => {
    if (!hosts.length) return Promise.resolve();

    const batches = hosts.reduce((acc, host) => {
      if(_.last(acc).length < 50) {
        _.last(acc).push(host);
      } else {
        acc.push([host]);
      }
      return acc;
    }, [[]]);

    const client = server.plugins.elasticsearch.getCluster('data').callWithInternalUser;
    const panel = doc.visState.params;
    const from = moment.utc().subtract(panel.from_value, panel.from_units);
    const to = moment.utc().subtract(panel.to_value, panel.to_units);
    const updatedOn = moment.utc().toISOString();
    const req = {
      payload: {
        filters: [],
        panel,
        timerange: {
          max: to.toISOString(),
          min: from.toISOString()
        }
      }
    };

    Promise.map(batches, (hosts) => {
      return getColumnData(req, panel, hosts, client)
        .then(results => {
          const body = [];
          results.forEach(doc => {
            const _id = _.get(doc, panel.id_field);
            body.push({
              index: {
                _index: panel.target_index,
                _type: 'doc',
                _id
              }
            });
            body.push({
              '@updatedOn': updatedOn,
              ...doc
            });
          });
          return client('bulk', { body });
        });
    });

  });
}
