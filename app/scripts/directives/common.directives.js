
/**
 * @ngdoc function
 * @name mtgJsApp.directive:ngHideAuth
 * @description
 * # ngHideAuthDirective
 * A directive that shows elements only when user is logged out. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('mtgJsApp')
  .directive('classShowState', ['$state', function ($state) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        var classShowState = attrs['classShowState'] || 'game';

        if ($state.includes(classShowState)) {
          el.addClass('container-full');
        }
      }
    };
  }]);
