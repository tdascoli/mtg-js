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
    .controller('GameCtrl', function($scope, profile, lobbyName, game){

      $scope.game = game;
      $scope.lobbyName = lobbyName;

    });

}());
