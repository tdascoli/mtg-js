'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DeckParserCtrl', function ($scope, $state, DeckParserService) {

    $scope.deckList='';
    $scope.deck={};

    $scope.deckFormat='mtgf';
    $scope.formats=DeckParserService.formats;

    $scope.importDeck=function(){
      $scope.deck=DeckParserService.parseDeck($scope.deckFormat,$scope.deckList);
      $state.go('decks/create/imported', {importDeck: $scope.deck.name});
    };

  });
