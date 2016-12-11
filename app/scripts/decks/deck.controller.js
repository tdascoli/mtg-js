'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('DeckCtrl', function ($scope, $rootScope, $uibModal, $stateParams, $state, CardsService, DeckParserService, lodash, profile, decks) {

    $scope.card=undefined;
    $scope.currentEdition=undefined;

    $scope.deck={name:'New Deck',main:[],sideboard:[]};
    $scope.decks = decks;

    $scope.params = CardsService.params;

    /*
    $scope.sortedCards={main:[],sideboard:[]};

    function reduceCards(cards) {
      return lodash.reduce(cards, function(result, value, key) {
        (result[value.id] || (result[value.id] = [])).push(cards[key]);
        return result;
      }, {});
    }

    $scope.$watchCollection('deck.main', function() {
      $scope.sortedCards.main = reduceCards($scope.deck.main);
    });

    $scope.$watchCollection('deck.sideboard', function() {
      $scope.sortedCards.sideboard = reduceCards($scope.deck.sideboard);
    });*/

    // INIT
    CardsService.filterCards(false).success(function (result) {
      $scope.cards = result;
    })
    .error(function (error) {
      $scope.idle = false;
      console.error(error);
    });

    if ($stateParams.deckId!==undefined){
      $scope.deck = $scope.decks.$getRecord($stateParams.deckId);
    }
    if ($stateParams.importDeck!==undefined){
      // prepare?!
      $scope.deck = DeckParserService.deck;
    }
    // .INIT

    $scope.showCard = function (card, deck) {
      $scope.card=card;
      $scope.card.deck=deck;
      $scope.setCurrentEdition($scope.card.editions[0]);

      if ($rootScope.mobile) {
        $uibModal.open({
          animation: true,
          scope: $scope,
          templateUrl: 'views/decks/modal/card.html',
          size: 'lg',
          controller: 'ModalInstanceCtrl'
        });
      }
    };

    // vereinfachen!
    $scope.showCardById = function (cardId, deck) {
      CardsService.showCard(cardId).success(function (result) {
        $scope.card=result;
        $scope.card.deck=deck;
        $scope.setCurrentEdition($scope.card.editions[0]);

        if ($rootScope.mobile) {
          $uibModal.open({
            animation: true,
            scope: $scope,
            templateUrl: 'views/decks/modal/card.html',
            size: 'lg',
            controller: 'ModalInstanceCtrl'
          });
        }
      })
      .error(function (error) {
        console.error(error);
      });
    };

    $scope.setCurrentEdition=function(edition){
      $scope.currentEdition=edition;
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

    $scope.addCard=function(amount,main){
      if ($scope.card!==undefined) {
        for (var i =0; i < amount; i++) {
          $scope.addCardByCard($scope.card,main);
        }
      }
    };

    $scope.addCardById=function(cardId,setId,main){
      CardsService.showCard(cardId).success(function (card) {
        if (angular.isString(setId)) {
          var edition=lodash.find(card.editions, { 'set_id': setId });
          if (edition===undefined){
            edition=card.editions[0];
          }
          $scope.setCurrentEdition(edition);
          card.editions = new Array($scope.currentEdition);
        }
        $scope.card=card;
        $scope.addCardByCard(card,main);
      })
      .error(function (error) {
        console.error(error);
      });
    };

    $scope.addCardByCard=function(card,main){
      if (main) {
        $scope.deck.main.push(card);
      }
      else {
        if ($scope.deck.sideboard===undefined){
          $scope.deck.sideboard=[];
        }
        $scope.deck.sideboard.push(card);
      }
    };

    $scope.showBasiclandModal=function(){
      $uibModal.open({
        animation: true,
        scope: $scope,
        templateUrl: 'views/decks/modal/basiclands.html',
        size: 'lg',
        controller: 'ModalInstanceCtrl'
      });
    };

    $scope.removeCard=function(){
      $scope.card.deck=false;
      $scope.deck.main.splice($scope.deck.main.indexOf($scope.card), 1);
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
          }, function errorCallback(response) {
            console.log('error!',response);
          });
        }
        else {
          console.log('error saving deck!');
        }
      }
    };
  });
