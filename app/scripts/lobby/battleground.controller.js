;(function () {
  'use strict';

  angular.module('mtgJsApp')
    .controller('BattlegroundCtrl', function($scope, $uibModal, lodash, BattlegroundService, CardsService, deck, profile){

      $scope.idle=true;
      $scope.status={
        priority:'username',
        turn:0,
        phase:0,
        user:'username',
        stack:'Empty'
      };
      $scope.log=[];

      //--- USER ---//
      $scope.profile=profile;
      $scope.user={
        life:20,
        mana:0,
        library:[],
        hand:[],
        graveyard:[],
        exile:[],
        playground:{
          creatures:[],
          permanents:[],
          lands:[]
        }
      };

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

        if ($scope.phases[$scope.status.phase].disabled){
          $scope.status.phase++;
          checkPhase();
        }
      }

      function initPhase(){
        var initPhase = $scope.getCurrentPhase();
        if (initPhase==='dr'){
          // draw phase
          $scope.drawCardPhase();
        }
      }

      $scope.nextPhase=function(){
        $scope.status.phase++;
        // todo --> next Player
        if ($scope.status.phase===$scope.phases.length){
          $scope.status.phase=0;
          $scope.nextTurn();
        }
        // check if Next Phase is Disabled
        checkPhase();
        // todo check functions for current phase?!
        initPhase();
      };

      $scope.nextTurn=function(){
        console.log('next turn');
        // todo upkeep
        $scope.upkeepPhase();

        $scope.status.turn++;
        // todo next turn, new user!
        $scope.status.user=profile.name;
      };

      $scope.upkeepPhase=function(){
        console.log('upkeep');
        angular.forEach($scope.user.playground, function (playground) {
          angular.forEach(playground, function(card){
            card.tapped=false;
            card.summoned=false;
          });
        });
      };

      // todo end Turn -> next Player

      $scope.getCurrentPhase=function(){
        return $scope.phases[$scope.status.phase].phase;
      };
      $scope.getCurrentPhaseName=function(){
        return $scope.phases[$scope.status.phase].phaseName;
      };

      $scope.togglePhase=function(index){
        $scope.phases[index].disabled=!$scope.phases[index].disabled;
      };
      //--- END PHASES ---//

      //--- DECK (Library, Graveyard, Exile, Hand etc.) ---//
      // todo load with choosen deck
      $scope.deck = deck;

      $scope.shuffleLibrary=function(){
        $scope.user.library=lodash.shuffle($scope.user.library);
      };
      //--- DECK.HAND ---//
      $scope.drawFullHand=function(){
        var fullHand=7;
        if ($scope.user.library.length<7){
          fullHand=$scope.user.library.length;
        }
        drawCards(fullHand);
      };

      $scope.drawMulligan=function(){
        var amount = $scope.user.hand.length--;
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
        var hand = $scope.user.library.splice(0,amount);
        angular.forEach(hand, function(card){
          $scope.user.hand.push(card);
        });
      }

      $scope.playCardByIndex=function(index){
        // log/stack
        var card = $scope.user.hand[index];

        console.log('play card',card.name);

        // remove from hand
        $scope.user.hand.splice(index,1);

        if (card.types[0]==='creature' || card.types[0]==='planeswalker'){
          card.summoned=true;
          $scope.user.playground.creatures.push(card);
        }
        else if (card.types[0]==='land'){
          $scope.user.playground.lands.push(card);
        }
        else if (card.types[0]==='artifact' || card.types[0]==='enchantment') {
          $scope.user.playground.permanents.push(card);
        }
        else {
          $scope.user.graveyard.push(card);
        }
      };

      // obsolete
      $scope.playCard=function(){
        // log/stack
        console.log('play card',$scope.card.name);

        // remove from hand
        $scope.user.hand.splice($scope.cardIndex,1);

        if ($scope.card.types[0]==='creature' || $scope.card.types[0]==='planeswalker'){
          if ($scope.card.types[0]==='creature'){
            $scope.card.summoned=true;
          }
          console.log($scope.card);
          $scope.user.playground.creatures.push($scope.card);
        }
        else if ($scope.card.types[0]==='land'){
          $scope.user.playground.lands.push($scope.card);
        }
        else if ($scope.card.types[0]==='artifact' || $scope.card.types[0]==='enchantment') {
          $scope.user.playground.permanents.push($scope.card);
        }
        else {
          $scope.user.graveyard.push($scope.card);
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


      if ($scope.idle){
        $scope.user.library = $scope.deck.main;
        // todo add id to every card?!
        $scope.shuffleLibrary();
        // todo coin
        $scope.drawFullHand();
        // todo ask for mulligan
        // todo next turn? firstTurn?
        $scope.nextTurn();
        // todo next phase?!
        // $scope.nextPhase();
      }
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
