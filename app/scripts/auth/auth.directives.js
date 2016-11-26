
/**
 * @ngdoc function
 * @name mtgJsApp.directive:ngHideAuth
 * @description
 * # ngHideAuthDirective
 * A directive that shows elements only when user is logged out. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('mtgJsApp')
  .directive('ngHideAuth', ['Auth', '$timeout', function (Auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it
        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !!Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuthStateChanged(update);
        update();
      }
    };
  }])
  .directive('ngShowAuth', ['Auth', '$timeout', function (Auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuthStateChanged(update);
        update();
      }
    };
  }])
  /** show/hide on auth? true/false */
  .directive('ngShowOrHideOnAuth', ['Auth', '$timeout', function (Auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        var what = attrs.ngShowOrHideOnAuth;

        function update() {
          $timeout(function () {
            if (what==='show'){
              el.toggleClass('ng-cloak', !Auth.$getAuth());
            }
            else {
              el.toggleClass('ng-cloak', !!Auth.$getAuth());
            }
          }, 0);
        }

        if (what==='show' || what==='hide'){
          el.addClass('ng-cloak'); // hide until we process it

          Auth.$onAuthStateChanged(update);
          update();
        }
      }
    };
  }]);
