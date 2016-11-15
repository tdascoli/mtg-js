;(function () {
  'use strict';
/**
 * @ngdoc function
 * @name AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('mtgJsApp')
  .controller('AccountCtrl', function ($rootScope, $scope, $state, md5, auth, profile) {
    $rootScope.profile = profile;

    $scope.updateProfile = function(){
      //$rootScope.profile.emailHash = md5.createHash(auth.email);
      $rootScope.profile.email = auth.email;
      $rootScope.profile.$save().then(function(){
        $state.go('channels');
      });
    };

  });

}());
