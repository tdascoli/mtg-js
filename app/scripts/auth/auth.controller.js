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
  .controller('AuthCtrl', function (Auth, $scope, $state) {

    $scope.user = {
      email: '',
      password: ''
    };

    $scope.login = function (){
      Auth.$signInWithEmailAndPassword($scope.user.email,$scope.user.password).then(function (){
        $state.go('account');
      }, function (error){
        $scope.error = error;
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
