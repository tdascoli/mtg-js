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
    .controller('LobbyCtrl', function($scope, $state, Auth, Users, profile, lobbies){
      $scope.profile = profile;
      $scope.lobbies = lobbies;

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
        $scope.lobbies.$add($scope.newGame).then(function(ref){
          $state.go('lobby.messages', {lobbyId: ref.key()});
        });
      };
    });

}());
