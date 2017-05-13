import getRequestParams from './get_request_params';
import handleResponseBody from './handle_response_body';
import handleErrorResponse from './handle_error_response';
export function getColumnData(req, panel, hosts) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('data');
  const params = {
    body: getRequestParams(req, panel, hosts)
  };
  return callWithRequest(req, 'msearch', params)
    .then(resp => {
      const handler = handleResponseBody(panel);
      return hosts.map((host, index) => {
        host.data = handler(resp.responses[index]);
        return host;
      });
    })
    .catch(handleErrorResponse(panel));
}

