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
      link: function (scope, el) {
        if ($state.includes('game') || $state.includes('solitaire')) {
          el.addClass('container-full');
        }
      }
    };
  }])
  .directive('hideOnState', ['$state', function ($state) {
    'use strict';

    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        var state = attrs.hideOnState;
        if ($state.includes(state)) {
          el.addClass('hide');
        }
      }
    };
  }])
  .directive('showOnState', ['$state', function ($state) {
    'use strict';

    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        var state = attrs.showOnState;
        el.addClass('hide');

        if ($state.includes(state)) {
          el.removeClass('hide');
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
      link: function (scope, el, attrs) {
        if (scope.renderCost!=='' && scope.renderCost!==undefined) {
          var costs = scope.renderCost.split('{');
          angular.forEach(costs, function (cost) {
            if (cost !== '') {
              var costElement = angular.element('<i class="ms ms-cost ms-shadow"></i>');

              var finalCost = cost.replace('}', '').toLowerCase();

              // phyrexia/split mana
              if (finalCost.indexOf('/') >= 0) {
                var manas = finalCost.split('/');
                // phyrexia
                if (manas[0] === 'p' || manas[1] === 'p') {
                  finalCost = manas[0] + ' ms-' + manas[1];
                }
                else {
                  // split
                  finalCost = manas[0] + manas[1] + ' ms-split';
                }
              }
              else if (finalCost === 'hw') {
                finalCost = 'w';
              }

              costElement.addClass('ms-' + finalCost);

              if (cost === 'hw}') {
                var hwCost = angular.element('<span class="ms-half"></span>');
                el.wrap(hwCost);
              }

              el.before(costElement);
            }
          });
        }
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
      link: function (scope, el) {
        el.addClass('ss-' + scope.renderExpansion.toLowerCase());

        if (scope.renderRarity !== undefined) {
          el.addClass('ss-' + scope.renderRarity);
        }
      }
    };
  }])
  .directive('renderRarity', [function () {
    'use strict';

    return {
      restrict: 'A',
      scope: {
        renderRarity: '='
      },
      link: function (scope, el) {
        if (scope.renderRarity!=='' && scope.renderRarity!==undefined) {
          el.addClass(scope.renderRarity.toLowerCase());
        }
      }
    };
  }])
  .directive('renderPAndT', [function () {
    'use strict';

    return {
      restrict: 'A',
      scope: {
        renderPAndT: '=',
        renderP: '=',
        renderT: '='
      },
      link: function (scope, el) {
        if (scope.renderPAndT==='creature') {
          var pAndT = angular.element('<span>'+scope.renderP+'/'+scope.renderT+'</span>');
          el.append(pAndT);
        }
        else {
          el.addClass('hide');
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
      link: function (scope, el) {
        if (scope.renderColor === undefined) {
          el.after('colorless');
        }
        else if (scope.renderColor.length === 1) {
          el.after(scope.renderColor[0]);
        }
        else if (scope.renderColor.length > 0) {
          el.after('multi');
        }
      }
    };
  }])
  .directive('clearInput', ['$parse',
    function ($parse) {
      'use strict';

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr) {
          var htmlMarkup = attr.clearBtnMarkup ? attr.clearBtnMarkup : '<i class="material-icons">clear</i>';
          var btn = angular.element(htmlMarkup);
          btn.addClass(attr.clearBtnClass ? attr.clearBtnClass : 'clear-btn');
          element.after(btn);
          element.addClass('clear-input');

          btn.on('click', function (event) {
            if (attr.clearInput) {
              var fn = $parse(attr.clearInput);
              scope.$apply(function () {
                fn(scope, {
                  $event: event
                });
              });
            } else {
              scope[attr.ngModel] = null;
              scope.$digest();
            }
          });

          scope.$watch(attr.ngModel, function (val) {
            var hasValue = val && val.length > 0;
            if (!attr.clearDisableVisibility) {
              btn.css('visibility', hasValue ? 'visible' : 'hidden');
            }

            if (hasValue && !btn.hasClass('clear-visible')) {
              btn.removeClass('clear-hidden').addClass('clear-visible');
            } else if (!hasValue && !btn.hasClass('clear-hidden')) {
              btn.removeClass('clear-visible').addClass('clear-hidden');
            }
          });
        }
      };
    }
  ])
  // Add this directive where you keep your directives
  .directive('onLongPress', function($timeout) {
    return {
      restrict: 'A',
      link: function($scope, $elm, $attrs) {
        $elm.bind('touchstart', function(evt) {
          // Locally scoped variable that will keep track of the long press
          $scope.longPress = true;

          // We'll set a timeout for 600 ms for a long press
          $timeout(function() {
            if ($scope.longPress) {
              // If the touchend event hasn't fired,
              // apply the function given in on the element's on-long-press attribute
              $scope.$apply(function() {
                $scope.$eval($attrs.onLongPress)
              });
            }
          }, 600);
        });

        $elm.bind('touchend', function(evt) {
          // Prevent the onLongPress event from firing
          $scope.longPress = false;
          // If there is an on-touch-end function attached to this element, apply it
          if ($attrs.onTouchEnd) {
            $scope.$apply(function() {
              $scope.$eval($attrs.onTouchEnd)
            });
          }
        });
      }
    };
  });
