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
    .controller('GameCtrl', function($scope, profile, lobbyName, games, messages){

      $scope.game = '';
      $scope.games = games;
      $scope.message = '';
      $scope.messages = messages;
      $scope.lobbyName = lobbyName;

      $scope.sendMessage = function (){
        if($scope.message.length > 0){
          $scope.messages.$add({
            uid: profile.$id,
            body: $scope.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          }).then(function (){
            $scope.message = '';
          });
        }
      };
    });

}());
