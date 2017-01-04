angular.module('mtgJsApp')
  .directive('playgroundOpponentHand', [function () {
    'use strict';

    return {
      restrict: 'C',
      priority: 1100,
      link: function(scope, element) {
        element.css('margin-bottom',-($('.playground__hand').outerHeight(true)));
      }
    };
  }]);
