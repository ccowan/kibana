import buildProcessorFunction from './build_processor_function';
import _ from 'lodash';
import processors from './response_processors/series';

export default function handleResponseBody(panel) {
  return resp => {
    if (resp.error) {
      const err = new Error(resp.error.type);
      err.response = JSON.stringify(resp);
      console.log(err);
      throw err;
    }
    return panel.columns.map(column => {
      const processor = buildProcessorFunction(processors, resp, panel, column);
      return _.first(processor([]));
    });
  };
}
