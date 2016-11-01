(function() {
  'use strict';
  angular.module('firebase.appauth', ['firebase', 'firebase.ref'])

    .factory('Auth', ['$firebaseAuth','Ref', function($firebaseAuth) {
      return $firebaseAuth(firebase.auth());
    }]);
})();
