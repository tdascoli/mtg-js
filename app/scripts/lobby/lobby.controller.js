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
    .controller('LobbyCtrl', function ($scope, $rootScope, $state, lodash, Auth, lobby, decks) {
      $scope.lobby = lobby;
      $scope.decks = decks;
      $scope.solitaire=false;

      $scope.logout = function () {
        Auth.$signOut();
        $state.go('home');
      };

      $scope.newGame = {
        name: '',
        player1: {
          name: $rootScope.profile.name,
          userId: $rootScope.profile.$id,
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
          stack:[]
        },
        connected: {
          player1:false,
          player2:false
        }
      };

      $scope.joinOrNot=function(player1,player2){
        if (player2==='' && player1!==$rootScope.profile.$id){
          // JOIN
          return true;
        }
        else if (player1===$rootScope.profile.$id && player2!==''){
          // no Join
          return false;
        }
        return false;
      };

      $scope.createGame = function () {
        if (!$scope.solitaire) {
          var deck = lodash.find($scope.decks, {$id: $scope.newGame.player1.deckId});
          $scope.newGame.player1.library = deck.main;

          $scope.lobby.$add($scope.newGame).then(function (ref) {
            $state.go('lobby/game', {gameId: ref.key});
          });
        }
        else {
          $state.go('solitaire', {deckId: $scope.newGame.player1.deckId});
        }
      };

    });

}());
