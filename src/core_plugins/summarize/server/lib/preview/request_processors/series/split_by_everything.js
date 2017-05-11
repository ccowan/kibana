import _ from 'lodash';
export default function splitByEverything(req, panel, series) {
  return next => doc => {
    _.set(doc, `aggs.${series.id}.filter.match_all`, {});
    return next(doc);
  };
}

