import _ from 'lodash';
export default function splitByEverything(req, panel) {
  return next => doc => {
    panel.columns.forEach(column => {
      _.set(doc, `aggs.${column.id}.filter.match_all`, {});
    });
    return next(doc);
  };
}

