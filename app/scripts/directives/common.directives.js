
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
        var classShowState = attrs.classShowState || 'game';

        if ($state.includes(classShowState)) {
          el.addClass('container-full');
        }
      }
    };
  }])
  .directive('renderCost', [function () {
    'use strict';

    return {
      restrict: 'A',
      scope: {
        renderCost: '='
      },
      link: function(scope, el) {
        var costs = scope.renderCost.split('{');
        angular.forEach(costs, function(cost){
          if (cost!=='') {
            var costElement = angular.element('<i class="ms ms-cost ms-shadow"></i>');

            var finalCost = cost.replace('}', '').toLowerCase();

            costElement.addClass('ms-' + finalCost);

            el.before(costElement);
          }
        });
      }
    };
  }])
  .directive('renderColor', [function () {
    'use strict';

    return {
      restrict: 'A',
      scope: {
        renderColor: '='
      },
      link: function(scope, el) {
        if (scope.renderColor===undefined){
          el.after('colorless');
        }
        else if (scope.renderColor.length===1){
          el.after(scope.renderColor[0]);
        }
        else if (scope.renderColor.length>0){
          el.after('multi');
        }
      }
    };
  }]);
