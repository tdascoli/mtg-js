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
    .controller('LobbyCtrl', function ($scope, $state, lodash, Auth, profile, lobby, decks) {
      $scope.profile = profile;
      $scope.lobby = lobby;
      $scope.decks = decks;

      $scope.logout = function () {
        Auth.$signOut();
        $state.go('home');
      };

      $scope.newGame = {
        name: '',
        new: true,
        player1: {
          name: profile.name,
          userId: profile.$id,
          deckId: '',
          library: [],
          life: 20,
          mana: 0
        },
        player2: {
          name: '-player 2-',
          userId: '',
          deckId: '',
          life: 20,
          mana: 0
        },
        status: {
          priority:'username',
          turn:0,
          phase:0,
          user:'username',
          stack:'Empty'
        },
        connected: {
          player1:false,
          player2:false
        }
      };

      $scope.joinOrNot=function(player1,player2){

        if (player2==='' && player1!==profile.$id){
          // JOIN
          return true;
        }
        else if (player1===profile.$id && player2!==''){
          // no Join
          return false;
        }
        return false;
      };

      $scope.createGame = function () {
        var deck = lodash.find($scope.decks, {$id: $scope.newGame.player1.deckId });
        $scope.newGame.player1.library=deck.main;

        $scope.lobby.$add($scope.newGame).then(function (ref) {
          $state.go('lobby/game', {gameId: ref.key()});
        });
      };
    });

}());
