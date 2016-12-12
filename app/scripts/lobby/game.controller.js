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
    .controller('GameCtrl', function($scope, game, lobbyName, profile, decks){

      $scope.game = game;
      $scope.lobbyName = lobbyName;
      $scope.profile=profile;
      $scope.decks=decks;

    });

}());
