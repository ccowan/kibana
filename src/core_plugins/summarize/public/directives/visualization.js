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
      const addToState = ['model', 'visData', 'reversed'];
      const Component = addScope(Visualization, $scope, addToState);
      render(<Component className="dashboard__visualization"/>, $el[0]);
      $scope.$on('$destroy', () => unmountComponentAtNode($el[0]));
    }
  };
});

