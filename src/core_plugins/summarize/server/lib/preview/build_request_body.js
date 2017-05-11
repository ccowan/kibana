import buildProcessorFunction from './build_processor_function';
import processors from './request_processors/series';

function buildRequestBody(req, panel, host) {
  const processor = buildProcessorFunction(processors, req, panel, host);
  const doc = processor({});
  return doc;
}

export default buildRequestBody;
