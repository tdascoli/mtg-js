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
    .controller('GameJoinCtrl', function ($scope, $state, lodash, profile, game, decks) {
      $scope.profile = profile;
      $scope.game = game;
      $scope.decks = decks;

      $scope.newGame = {
        player2: {
          name: profile.name,
          userId: profile.$id,
          deckId: '',
          library: [],
          life: 20,
          mana: 0
        }
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
