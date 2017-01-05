;(function () {
  'use strict';
/**
 * @ngdoc function
 * @name AuthCtrl
 * @description
 * # AuthCtrl
 * Provides rudimentary account management functions.
 */
angular.module('mtgJsApp')
  .controller('AuthCtrl', function (Auth, Users, $scope, $rootScope, $state) {

    $scope.user = {
      email: '',
      password: ''
    };

    $scope.login = function (){
      Auth.$signInWithEmailAndPassword($scope.user.email,$scope.user.password).then(function (auth){
        Users.getProfile(auth.uid).$loaded().then(function (profile){
          $rootScope.profile=profile;
          $state.go('account');
        });
      }, function (error){
        $scope.error = error;
      });
    };

    $scope.logout=function(){
      // delete online...?!
      Auth.$signOut().then(function(){
        $state.go('login');
      });
    };

    $scope.register = function (){
      Auth.$createUserWithEmailAndPassword($scope.user.email,$scope.user.password).then(function (){
        $scope.login();
      }, function (error){
        $scope.error = error;
      });
    };
  });

}());
