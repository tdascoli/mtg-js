'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DeckCtrl', function ($scope, CardsService) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    CardsService.allCards().success(function (result) {
      $scope.cards = result;
      //$scope.idle = false;
    })
    .error(function (error) {
      $scope.idle = false;
      console.error(error);
    });
  });
