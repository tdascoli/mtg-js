'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DeckParserCtrl', function ($scope, DeckParserService) {

    $scope.deckList='';
    $scope.deck={};

    $scope.format=DeckParserService.format;
    $scope.formats=DeckParserService.formats;

    $scope.importDeck=function(){
      $scope.deck=DeckParserService.parseDeck($scope.deckList);
    };

  });
