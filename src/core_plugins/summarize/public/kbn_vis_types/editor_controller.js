import { uiModules } from 'ui/modules';
import '../services/executor';
import '../directives/editor';
import _ from 'lodash';
import angular from 'angular';
import { createNewSummarize } from '../lib/create_new_summarize';
import { FilterBarQueryFilterProvider } from 'ui/filter_bar/query_filter';

const app = uiModules.get('kibana/summarize', ['kibana']);
app.controller('SummarizeEditorController', (
  $location,
  $element,
  $scope,
  Private,
  timefilter,
  metricsExecutor
) => {

  $scope.embedded = $location.search().embed === 'true';
  const queryFilter = Private(FilterBarQueryFilterProvider);
  const createFetch = Private(require('../lib/fetch'));
  const fetch = () => {
    const fn = createFetch($scope);
    return fn().then((resp) => {
      $element.trigger('renderComplete');
      return resp;
    });
  };
  const fetchFields = Private(require('../lib/fetch_fields'));

  const debouncedFetch = _.debounce(() => {
    fetch();
  }, 1000, {
    leading: false,
    trailing: true
  });

  const debouncedFetchFields = _.debounce(fetchFields($scope), 1000, {
    leading: false,
    trailing: true
  });

  // If the model doesn't exist we need to either intialize it with a copy from
  // the $scope.vis._editableVis.params or create a new panel all together.
  if (!$scope.model) {
    if ($scope.vis._editableVis.params.id) {
      $scope.model = _.assign({}, $scope.vis._editableVis.params);
    } else {
      $scope.model = createNewSummarize();
      angular.copy($scope.model, $scope.vis._editableVis.params);
    }
  }

  $scope.$watchCollection('model', newValue => {
    angular.copy(newValue, $scope.vis._editableVis.params);
    $scope.stageEditableVis();
    debouncedFetch();

    const patternsToFetch = [];
    // Fetch any missing index patterns
    if (!$scope.fields[newValue.index_pattern]) {
      patternsToFetch.push(newValue.index_pattern);
    }

    if(patternsToFetch.length) {
      debouncedFetchFields(_.unique(patternsToFetch));
    }
  });

  $scope.visData = {};
  $scope.fields = {};
  $scope.pageNumber = 1;

  $scope.setPage = pageNumber => {
    $scope.pageNumber = pageNumber;
    fetch();
  };

  // All those need to be consolidated
  $scope.$listen(queryFilter, 'fetch', fetch);
  $scope.$on('fetch', fetch);

  fetchFields($scope)($scope.model.index_pattern);

  // Register fetch
  metricsExecutor.register({ execute: fetch });

  // Start the executor
  metricsExecutor.start();

  // Destory the executor
  $scope.$on('$destroy', metricsExecutor.destroy);

});

