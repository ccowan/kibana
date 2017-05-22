import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { uiModules } from 'ui/modules';
import Editor from '../components/editor';
import addScope from '../lib/add_scope';
import angular from 'angular';
const app = uiModules.get('apps/summarize/directives');
app.directive('summarizeEditor', () => {
  return {
    restrict: 'E',
    link: ($scope, $el) => {
      const addToState = [
        'autoApply',
        'dirty',
        'sort',
        'pageNumber',
        'embedded',
        'fields',
        'visData'
      ];
      const Component = addScope(Editor, $scope, addToState);
      const handlePaginate = (pageNumber) => {
        $scope.$evalAsync(() => $scope.setPage(pageNumber));
      };
      const handleChange = part => {
        $scope.$evalAsync(() => angular.copy(part, $scope.model));
      };
      const handleSort = sort => {
        $scope.$evalAsync(() => $scope.setSort(sort));
      };
      const handleToggleAutoApply = () => {
        $scope.$evalAsync(() => $scope.toggleAutoApply());
      };
      const handleCommit = () => {
        $scope.$evalAsync(() => $scope.commit());
      };
      render(<Component
        model={$scope.model}
        onPaginate={handlePaginate}
        onToggleAutoApply={handleToggleAutoApply}
        onCommit={handleCommit}
        onSort={handleSort}
        onChange={handleChange} />, $el[0]);
      $scope.$on('$destroy', () => {
        unmountComponentAtNode($el[0]);
      });
    }
  };
});

