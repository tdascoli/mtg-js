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

    $scope.card=undefined;
    $scope.deck={cards:[]};
    $scope.decks = decks;
    $scope.params = CardsService.params;

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
      }
      else {
        $scope.params.filter.push(param);
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
      /*if ($scope.card!==undefined) {
       for (var i =0; i < amount; i++) {
       $scope.deck.cards.push($scope.card);
       }
       }*/
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
      if (text!==undefined) {
        var regex = /{(.*?)}+/g;
        var oracle = text;
        var words = lodash.words(text, regex);

        angular.forEach(words, function (word) {
          var finalCost = word.replace('{', '').toLowerCase();
          finalCost = finalCost.replace('}', '').toLowerCase();
          // ausnahmen
          if (word==='{T}'){
            finalCost='tap';
          }
          else if (word.search('/')) {
            var manas = finalCost.split('/');
            finalCost=manas[0]+' ms-'+manas[1];
          }

          var wordElement = '<i class="ms ms-cost ms-' + finalCost + '"></i>';

          oracle = oracle.replace(word, wordElement);
        });

        return $sce.trustAsHtml(oracle);
      }
    };

    $scope.renderCost=function(renderCost){
      var allCost='';
      if (renderCost!==undefined) {
        var costs = renderCost.split('{');
        angular.forEach(costs, function (cost) {
          if (cost !== '') {
            var finalCost = cost.replace('}', '').toLowerCase();

            // phyrexia/split mana
            if (cost.indexOf('/')>=0) {
              var manas = finalCost.split('/');
              // phyrexia
              if (manas[0]==='p' || manas[1]==='p') {
                finalCost = manas[0] + ' ms-' + manas[1];
              }
              else {
                // split
                finalCost = manas[0] + manas[1] + ' ms-split';
              }
            }
            else if (finalCost==='hw'){
              finalCost = 'w';
            }

            if (cost==='hw}'){
              allCost += '<span class="ms-half"><i class="ms ms-cost ms-shadow ms-' + finalCost + '"></i></span>';
            }
            else {
              allCost += '<i class="ms ms-cost ms-shadow ms-' + finalCost + '"></i>';
            }
          }
        });
      }
      return $sce.trustAsHtml(allCost);
    };

    $scope.renderExpansion=function(set,rarity){
      if (set!==undefined){
        return 'ss-'+set.toLowerCase()+' ss-'+rarity;
      }
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
