import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Visualization from '../components/visualization';
import addScope from '../lib/add_scope';
import { uiModules } from 'ui/modules';

const app = uiModules.get('apps/summarize/directives');
app.directive('summarizeVisualization', () => {
  return {
    restrict: 'E',
    link: ($scope, $el) => {
      const addToState = ['sort', 'pageNumber', 'model', 'visData', 'reversed'];
      const Component = addScope(Visualization, $scope, addToState);
      const handlePaginate = (pageNumber) => {
        $scope.$evalAsync(() => $scope.setPage(pageNumber));
      };
      const handleSort = sort => {
        $scope.$evalAsync(() => $scope.setSort(sort));
      };
      render(<Component
        onPaginate={handlePaginate}
        onSort={handleSort}
        className="dashboard__visualization"/>, $el[0]);
      $scope.$on('$destroy', () => unmountComponentAtNode($el[0]));
    }
  };
});

