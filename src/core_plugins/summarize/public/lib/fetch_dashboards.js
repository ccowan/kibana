export default (
  Notifier,
  $http
) => {
  const notify = new Notifier({ location: 'Summarize' });
  return $scope => {
    return $http.get(`../api/saved_objects?fields=title&type=dashboard&per_page=100`)
      .success(resp => {
        if (resp.total !== 0) {
          $scope.dashboards = resp.saved_objects.map(doc => {
            return { id: doc.id, title: doc.attributes.title };
          });
        }
      })
      .error(resp => {
        $scope.dashboards = [];
        const err = new Error(resp.message);
        err.stack = resp.stack;
        notify.error(err);
      });
  };
};


