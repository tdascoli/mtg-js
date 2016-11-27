'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DecksCtrl', function ($scope, $sce, lodash, CardsService, profile, decks) {

    $scope.active=0;
    $scope.card=undefined;
    $scope.deck={cards:[]};
    $scope.decks = decks;
    $scope.params = CardsService.params;

    $scope.showEditor=function (index) {
      $scope.active=index;
    };

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

    $scope.renderOracle=function(text){
      return CardsService.renderOracle(text);
    };

    $scope.renderCost=function(renderCost){
      return CardsService.renderCost(renderCost);
    };

    $scope.renderExpansion=function(set,rarity){
      return CardsService.renderExpansion(set,rarity);
    };

    // SAVE
    $scope.saveDeck = function (){
      if($scope.deck.cards.length > 0 && $scope.deck.name!==undefined){
        $scope.decks.$add({
          uid: profile.$id,
          name: $scope.deck.name,
          cards: $scope.deck.cards,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(function (){
          console.log('saved - what about update?');
        });
      }
      else {
        console.log('error saving deck!');
      }
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