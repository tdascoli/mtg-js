;(function () {
  'use strict';

  angular.module('mtgJsApp')
    .controller('GameCtrl', function($scope, $uibModal, lodash, BattlegroundService, CardsService, Games, game, profile){

      $scope.idle=true;
      $scope.init=true;

      $scope.game=game;
      $scope.newGame = {
        player1: {
          library: [],
          hand: [],
          graveyard: [],
          exile: [],
          playground: {
            creatures: [],
            permanents: [],
            lands: []
          }
        },
        player2: {
          library: [],
          hand: [],
          graveyard: [],
          exile: [],
          playground: {
            creatures: [],
            permanents: [],
            lands: []
          }
        },
        log: []
      };

      //--- USER ---//
      $scope.profile=profile;

      $scope.showCard = function (card, index, where) {
        $scope.card=card;
        $scope.cardIndex=index;
        $scope.cardWhere=where;

        $uibModal.open({
          animation: true,
          scope: $scope,
          templateUrl: 'views/lobby/modal/card.html',
          size: 'lg',
          controller: 'ModalInstanceCtrl'
        });
      };
      //--- END USER ---//

      //--- PHASES ---//
      $scope.phases=BattlegroundService.phases;

      function checkPhase(){
        // todo even if next phae disabled -> phase action!
        if ($scope.phases[$scope.game.status.phase].disabled){
          $scope.game.status.phase++;
          checkPhase();
        }
      }

      function doInitPhase(){
        var initPhase = $scope.getCurrentPhase();
        if (initPhase==='dr'){
          // draw phase
          $scope.drawCardPhase();
        }
      }

      $scope.nextPhase=function(){
        $scope.game.status.phase++;
        // todo --> next Player
        if ($scope.game.status.phase===$scope.phases.length){
          $scope.game.status.phase=0;
          $scope.nextTurn();
        }
        // check if Next Phase is Disabled
        checkPhase();
        // todo check functions for current phase?!
        doInitPhase();

        $scope.idle = false;
      };

      $scope.nextTurn=function(){
        console.log('next turn');
        // todo upkeep
        $scope.upkeepPhase();

        $scope.game.status.turn++;
        // todo next turn, new user! --> user.id
        $scope.game.status.user=profile.name;
      };

      $scope.upkeepPhase=function(){
        console.log('upkeep');
        angular.forEach($scope.game.player1.playground, function (playground) {
          angular.forEach(playground, function(card){
            card.tapped=false;
            card.summoned=false;
          });
        });
      };

      // todo end Turn -> next Player

      $scope.getCurrentPhase=function(){
        return $scope.phases[$scope.game.status.phase].phase;
      };
      $scope.getCurrentPhaseName=function(){
        return $scope.phases[$scope.game.status.phase].phaseName;
      };

      $scope.togglePhase=function(index){
        $scope.phases[index].disabled=!$scope.phases[index].disabled;
      };
      //--- END PHASES ---//

      //--- DECK (Library, Graveyard, Exile, Hand etc.) ---//
      $scope.shuffleLibrary=function(){
        $scope.game.player1.library=lodash.shuffle($scope.game.player1.library);
      };
      //--- DECK.HAND ---//
      $scope.drawFullHand=function(){
        var fullHand=7;
        if ($scope.game.player1.library.length<7){
          fullHand=$scope.game.player1.library.length;
        }
        drawCards(fullHand);
      };

      $scope.drawMulligan=function(){
        var amount = $scope.game.player1.hand.length--;
        drawCards(amount);
      };

      $scope.drawCards=function(amount){
        drawCards(amount);
      };

      $scope.drawCardPhase=function(){
        // todo when library.length===0 then lose game
        drawCards(1);
      };

      function drawCards(amount){
        var hand = $scope.game.player1.library.splice(0,amount);
        angular.forEach(hand, function(card){
          $scope.game.player1.hand.push(card);
        });
      }

      $scope.playCardByIndex=function(index){
        // log/stack
        var card = $scope.game.player1.hand[index];

        console.log('play card',card.name);

        // remove from hand
        $scope.game.player1.hand.splice(index,1);

        if (card.types[0]==='creature' || card.types[0]==='planeswalker'){
          card.summoned=true;
          $scope.game.player1.playground.creatures.push(card);
        }
        else if (card.types[0]==='land'){
          $scope.game.player1.playground.lands.push(card);
        }
        else if (card.types[0]==='artifact' || card.types[0]==='enchantment') {
          $scope.game.player1.playground.permanents.push(card);
        }
        else {
          $scope.game.player1.graveyard.push(card);
        }
      };

      // obsolete
      $scope.playCard=function(){
        // log/stack
        console.log('play card',$scope.card.name);

        // remove from hand
        $scope.game.player1.hand.splice($scope.cardIndex,1);

        if ($scope.card.types[0]==='creature' || $scope.card.types[0]==='planeswalker'){
          if ($scope.card.types[0]==='creature'){
            $scope.card.summoned=true;
          }
          console.log($scope.card);
          $scope.game.player1.playground.creatures.push($scope.card);
        }
        else if ($scope.card.types[0]==='land'){
          $scope.game.player1.playground.lands.push($scope.card);
        }
        else if ($scope.card.types[0]==='artifact' || $scope.card.types[0]==='enchantment') {
          $scope.game.player1.playground.permanents.push($scope.card);
        }
        else {
          $scope.game.player1.graveyard.push($scope.card);
        }
      };

      $scope.defaultAction=function(card){
        console.log('default action',card.name);
        $scope.tapCard(card);
      };

      $scope.tapCard=function(card){
        console.log('tap/untap card',card.name);
        // todo -> untap event?!
        if (!card.tapped || card.tapped===undefined){
          // todo undo?
          card.tapped=!card.tapped;
        }
      };

      // INIT
      $scope.loadGame=function(){
        // todo load game...
        $scope.game = lodash.merge($scope.game,$scope.newGame);
      };

      $scope.loadGame();

      if ($scope.game.new) {
        $scope.game.new=false;
        // todo add id to every card?!
        $scope.shuffleLibrary();
        // todo coin
        $scope.drawFullHand();
        // todo ask for mulligan
        // todo next turn? firstTurn? > priority!
        // $scope.nextTurn();
        // todo next phase?!
        $scope.nextPhase();
        $scope.init = false;
      }

      // SAVE
      /*
      $scope.$watchCollection('game', function() {
        $scope.save();
      });
      */
      $scope.save=function(){
        $scope.idle=true;
        $scope.game.$save().then(function (){
          // load game and merge with array
          $scope.loadGame();
          $scope.idle=false;
          console.log('saved');
        });
      };
      //--- END DECK ---//

      //--- CARDS ---//
      // Example functions
      $scope.itemOnLongPress = function() {
        console.log('Long press');
      };

      $scope.itemOnTouchEnd = function() {
        console.log('Touch end');
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

      $scope.renderPandT=function(type,power,toughness){
        return CardsService.renderPandT(type,power,toughness);
      };
      //--- END CARDS ---//

    });

}());
