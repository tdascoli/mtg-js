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
    .controller('GameJoinCtrl', function ($scope, $rootScope, $state, lodash, Users, game, decks) {
      $scope.game = game;
      $scope.decks = decks;

      $scope.newGame = {
        player2: {
          name: $rootScope.profile.name,
          userId: $rootScope.profile.$id,
          deckId: '',
          library: [],
          life: 20,
          mana: 0
        }
      };

      $scope.getOpponentEmail=function(){
        return Users.getEmail($scope.game.player1.userId);
      };

      $scope.joinGame = function () {
        var deck = lodash.find($scope.decks, {$id: $scope.newGame.player2.deckId });
        $scope.newGame.player2.library=deck.main;

        $scope.game.player2=$scope.newGame.player2;

        $scope.game.$save().then(function (){
          $state.go('lobby/game', {gameId: $scope.game.$id});
        });
      };
    });

}());
