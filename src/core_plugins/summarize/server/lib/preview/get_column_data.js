import getRequestParams from './get_request_params';
import handleResponseBody from './handle_response_body';
import handleErrorResponse from './handle_error_response';
import getLastValue from '../../../common/get_last_value';
import _ from 'lodash';
import regression from 'regression';
export function getColumnData(req, panel, hosts, client) {
  const elasticsearch = _.get(req, 'server.plugins.elasticsearch');
  if (elasticsearch) {
    const { callWithRequest } = elasticsearch.getCluster('data');
    if (!client) {
      client = callWithRequest.bind(null, req);
    }
  }
  const params = {
    body: getRequestParams(req, panel, hosts)
  };
  return client('msearch', params)
    .then(resp => {
      const handler = handleResponseBody(panel);
      return hosts.map((host, index) => {
        host.data = {};
        handler(resp.responses[index]).forEach(row => {
          const linearRegression = regression('linear', row.data);
          host.data[row.id] = {
            last: getLastValue(row.data),
            slope: linearRegression.equation[0],
            yIntercept: linearRegression.equation[1],
            label: row.label
          };
        });
        return host;
      });
    })
    .catch(handleErrorResponse(panel));
}

