import getRequestParams from './get_request_params';
import handleResponseBody from './handle_response_body';
import handleErrorResponse from './handle_error_response';
import getLastValue from '../../../common/get_last_value';
import regression from 'regression';
export function getColumnData(req, panel, hosts) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const params = {
    body: getRequestParams(req, panel, hosts)
  };
  return callWithRequest(req, 'msearch', params)
    .then(resp => {
      const handler = handleResponseBody(panel);
      return hosts.map((host, index) => {
        host.data = handler(resp.responses[index])
          .map(row => {
            row.last = getLastValue(row.data);
            const linearRegression = regression('linear', row.data);
            row.slope = linearRegression.equation[0];
            row.yIntercept = linearRegression.equation[1];
            return row;
          });
        return host;
      });
    })
    .catch(handleErrorResponse(panel));
}

