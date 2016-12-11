;(function () {
  'use strict';
  /**
   * @ngdoc function
   * @name ChannelsCtrl
   * @description
   * # ChannelsCtrl
   * Provides rudimentary account management functions.
   */
  angular.module('mtgJsApp')
    .controller('LobbyCtrl', function($scope, $state, Auth, Users, profile, lobby){
      $scope.profile = profile;
      $scope.lobby = lobby;

      $scope.getDisplayName = Users.getDisplayName;
      $scope.getEmail = Users.getEmail;

      $scope.logout = function(){
        Auth.$signOut();
        $state.go('home');
      };

      $scope.newGame = {
        name: ''
      };

      $scope.createGame = function(){
        $scope.lobby.$add($scope.newGame).then(function(ref){
          $state.go('lobby/game', {gameId: ref.key()});
        });
      };
    });

}());
