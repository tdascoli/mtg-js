'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DeckCtrl', function ($scope, $rootScope, $uibModal, $stateParams, $state, CardsService, lodash, profile, decks) {

    $scope.card=undefined;
    $scope.deck={name:'New Deck',main:[],sideboard:[]};
    $scope.decks = decks;
    $scope.params = CardsService.params;

    if ($stateParams.deckId!==undefined){
      $scope.deck = $scope.decks.$getRecord($stateParams.deckId);
    }

    $scope.showCard = function (cardId) {
      CardsService.showCard(cardId).success(function (result) {
        $scope.card=result;

        if ($rootScope.mobile) {
          $uibModal.open({
            animation: true,
            scope: $scope,
            templateUrl: 'views/decks/modal-card.html',
            size: 'lg',
            controller: 'ModalInstanceCtrl'
          });
        }
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
          $scope.deck.main.push($scope.card);
        }
      }
    };

    $scope.removeCard=function(amount){
      if ($scope.card!==undefined) {
       for (var i =0; i < amount; i++) {
         lodash.remove($scope.deck.main, $scope.card);
       }
      }
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
      if ($stateParams.deckId!==undefined){
        $scope.decks.$save($scope.deck).then(function (){
          console.log('update!');
        });
      }
      else {
        if ($scope.deck.main.length > 0 && $scope.deck.name !== undefined) {
          $scope.decks.$add({
            name: $scope.deck.name,
            main: $scope.deck.main,
            sideboard: $scope.deck.sideboard,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          }).then(function (ref) {
            console.log('saved!');
            $state.go('decks/deck',{deckId:ref.key});
          });
        }
        else {
          console.log('error saving deck!');
        }
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
  })
  .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
    $scope.closeModalCard = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
