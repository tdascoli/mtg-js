'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DeckCtrl', function ($scope, $rootScope, CardsService, lodash, deck, Decks) {

    $scope.card=undefined;
    $scope.deck = deck;
    $scope.params = CardsService.params;

    $scope.renderOracle=function(text){
      return CardsService.renderOracle(text);
    };

    $scope.renderCost=function(renderCost){
      return CardsService.renderCost(renderCost);
    };

    $scope.renderExpansion=function(set,rarity){
      return CardsService.renderExpansion(set,rarity);
    };
    // factory!!!
    $scope.filterCards=function(pagination){

      $scope.idle = true;

      CardsService.filterCards(pagination).success(function (result) {
        if (result.length>0){
          $scope.cards = result;
        }
        else {
          $scope.params.pagination.page--;
        }
        $scope.idle = false;
      })
        .error(function (error) {
          $scope.idle = false;
          console.error(error);
        });
    };

    $scope.toggleParam=function(param){
      if (lodash.find($scope.params.filter, param)){
        lodash.remove($scope.params.filter, param);
        $('#'+param.param+'-'+param.value).removeClass('btn-active');
      }
      else {
        $scope.params.filter.push(param);
        $('#'+param.param+'-'+param.value).addClass('btn-active');
      }
    };

    $scope.pagination=function(where){
      if (where==='prev' && $scope.params.pagination.page>0){
        $scope.params.pagination.page--;
      }
      else if (where==='next'){
        $scope.params.pagination.page++;
      }

      $scope.filterCards(true);
    };

    $scope.addCard=function(amount){
      if ($scope.card!==undefined) {
        for (var i =0; i < amount; i++) {
          $scope.deck.cards.push($scope.card);
        }
      }
    };

    $scope.removeCard=function(amount){
      if ($scope.card!==undefined) {
        for (var i =0; i < amount; i++) {
          lodash.remove($scope.deck.cards, $scope.card);
        }
      }
    };

    $scope.showCard=function(cardId){
      CardsService.showCard(cardId).success(function (result) {
        $scope.card=result;
      })
        .error(function (error) {
          console.error(error);
        });
    };

    // UPDATE
    $scope.saveDeck = function (){
        Decks.$save($scope.deck).then(function (){
          console.log('update!');
        });
    };

    // INIT
    CardsService.filterCards(false).success(function (result) {
      $scope.cards = result;
    })
    .error(function (error) {
      $scope.idle = false;
      console.error(error);
    });
  });
