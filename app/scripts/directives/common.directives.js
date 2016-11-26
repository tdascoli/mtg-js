
/**
 * @ngdoc function
 * @name mtgJsApp.directive:ngHideAuth
 * @description
 * # ngHideAuthDirective
 * A directive that shows elements only when user is logged out. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('mtgJsApp')
  .directive('fullScreenState', ['$state', function ($state) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        if ($state.includes('game') || $state.includes('decks')) {
          el.addClass('container-full');
        }
      }
    };
  }])
  .directive('renderCost', [function () {
    'use strict';

    return {
      restrict: 'A',
      replace: true,
      scope: {
        renderCost: '='
      },
      link: function(scope, el) {
        var costs = scope.renderCost.split('{');
        angular.forEach(costs, function(cost){
          if (cost!=='') {
            var costElement = angular.element('<i class="ms ms-cost ms-shadow"></i>');

            var finalCost = cost.replace('}', '').toLowerCase();

            // phyrexia/split mana
            if (finalCost.indexOf('/')>=0) {
              var manas = finalCost.split('/');
              // phyrexia
              if (manas[0]==='p' || manas[1]==='p') {
                finalCost = manas[0] + ' ms-' + manas[1];
              }
              else {
                // split
                finalCost = manas[0] + manas[1] + ' ms-split';
              }
            }
            else if (finalCost==='hw'){
              finalCost = 'w';
            }

            costElement.addClass('ms-' + finalCost);

            if (cost==='hw}'){
              var hwCost = angular.element('<span class="ms-half"></span>');
              el.wrap(hwCost);
            }

            el.before(costElement);
          }
        });
      }
    };
  }])
  .directive('renderExpansion', [function () {
    'use strict';

    return {
      restrict: 'A',
      scope: {
        renderExpansion: '=',
        renderRarity: '='
      },
      link: function(scope, el) {
        el.addClass('ss-'+scope.renderExpansion.toLowerCase());

        if (scope.renderRarity!==undefined){
          el.addClass('ss-'+scope.renderRarity);
        }
      }
    };
  }])
  .directive('renderColor', [function () {
    'use strict';

    return {
      restrict: 'A',
      replace: true,
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
