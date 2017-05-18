import { validateInterval } from './validate_interval';
export default (
  timefilter,
  Private,
  Notifier,
  $http,
  config
) => {
  const dashboardContext = Private(require('../../../timelion/public/services/dashboard_context'));
  const notify = new Notifier({ location: 'Metrics' });
  return $scope => () => {
    const panel = $scope.model;
    if (panel && panel.id && panel.id_field) {
      const params = {
        page: $scope.pageNumber,
        timerange: timefilter.getBounds(),
        filters: [dashboardContext()],
        sort: $scope.sort,
        panel
      };

      try {
        const maxBuckets = config.get('metrics:max_buckets');
        validateInterval(timefilter, panel, maxBuckets);
        const endpoint = panel.indexing ? 'data' : 'preview';
        return $http.post(`../api/summarize/${endpoint}`, params)
          .success(resp => {
            $scope.visData = resp;
          })
          .error(resp => {
            $scope.visData = {};
            const err = new Error(resp.message);
            err.stack = resp.stack;
            notify.error(err);
          });
      } catch (e) {
        notify.error(e);
        return Promise.resolve();
      }
    }
    return Promise.resolve();
  };
};

