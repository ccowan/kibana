import buildRequestBody from './build_request_body';
export default (req, panel, hosts) => {
  const bodies = [];
  hosts.forEach(host => {
    bodies.push({
      index: panel.index_pattern,
      ignore: [404],
      timeout: '90s',
      requestTimeout: 90000,
      ignoreUnavailable: true,
    });
    bodies.push(buildRequestBody(req, panel, host));
  });
  return bodies;
};
