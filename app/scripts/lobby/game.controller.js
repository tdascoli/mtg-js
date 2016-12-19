;(function () {
  'use strict';

  angular.module('mtgJsApp')
    .controller('GameCtrl', function($scope, $uibModal, lodash, BattlegroundService, CardsService, Games, game, profile, connection){

      $scope.idle=true;
      $scope.init=true;
      $scope.connection=connection;
      $scope.players=[];

      // todo maybe loading different vars for different usage and save status!
      /*
        example:
        - library etc. former -scope.user (user independet?)
        - status
        - user informations such as deckId, userId, etc.
       */
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

      function resetConnection(){
        initGame();

        $scope.game.connected[$scope.getPlayer()]=false;
        $scope.game.connected[$scope.getOpponent()]=false;
        //---
        $scope.players[$scope.game.player1.userId]='player1';
        $scope.players[$scope.game.player2.userId]='player2';
        //---
        $scope.game.$save().then(function (){
          console.log('start game');
          $scope.init=false;
        });
      }

      $scope.loadGame=function(){
        // todo load game...
        //$scope.game = lodash.merge($scope.game,$scope.newGame);
        // players
        if ($scope.players.length===0){
          $scope.players[$scope.game.player1.userId]='player1';
          $scope.players[$scope.game.player2.userId]='player2';
        }
        // todo update player name?!
        // todo connect players
        if ($scope.init){
          // init player
          $scope.connection[$scope.getPlayer()]=true;
          $scope.connection.$save().then(function (){
            console.log('connected');
            if ($scope.connection[$scope.getOpponent()]){
              resetConnection();
            }
          });
        }

        $scope.idle=false;
      };

      // watch connection -- init
      $scope.$watchCollection('connection', function(){
        if ($scope.connection[$scope.getOpponent()] && $scope.init){
          console.log('opponent connected');
          // reset and init=false
          resetConnection();
        }
      });

      $scope.getPlayer=function(){
        return $scope.players[$scope.profile.$id];
      };
      $scope.getOpponent=function(){
        if ($scope.getPlayer()==='player1'){
          return 'player2';
        }
        return 'player1';
      };
      $scope.getNextPlayer=function(){
        if ($scope.game.status.user===$scope.game.player1.name){
          return 'player2';
        }
        return 'player1';
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
        // nextPhase!! > user independent...
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
        $scope.game.status.user=$scope.game[$scope.getNextPlayer()].name;
      };

      $scope.upkeepPhase=function(){
        console.log('upkeep');
        angular.forEach($scope.game[$scope.getPlayer()].playground, function (playground) {
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
        console.log('shuffle library');
        $scope.game[$scope.getPlayer()].lbrary=lodash.shuffle($scope.game[$scope.getPlayer()].library);
      };
      //--- DECK.HAND ---//
      $scope.drawFullHand=function(){
        console.log('draw full hand');
        var fullHand=7;
        if ($scope.game[$scope.getPlayer()].library.length<7){
          fullHand=$scope.game[$scope.getPlayer()].library.length;
        }
        drawCards(fullHand);
      };

      $scope.drawMulligan=function(){
        var amount = $scope.game[$scope.getPlayer()].hand.length--;
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
        var hand = $scope.game[$scope.getPlayer()].library.splice(0,amount);
        // check if array exists
        if ($scope.game[$scope.getPlayer()].hand===undefined) {
          $scope.game[$scope.getPlayer()].hand = [];
        }
        angular.forEach(hand, function(card){
          $scope.game[$scope.getPlayer()].hand.push(card);
        });
      }

      $scope.playCardByIndex=function(index){
        // log/stack
        var card = $scope.game[$scope.getPlayer()].hand[index];

        console.log('play card',card.name);

        // remove from hand
        $scope.game[$scope.getPlayer()].hand.splice(index,1);

        if (card.types[0]==='creature' || card.types[0]==='planeswalker'){
          card.summoned=true;
          // check if array exists
          if ($scope.game[$scope.getPlayer()].playground.creatures===undefined){
            $scope.game[$scope.getPlayer()].playground.creatures=[];
          }
          $scope.game[$scope.getPlayer()].playground.creatures.push(card);
        }
        else if (card.types[0]==='land'){
          // check if array exists
          if ($scope.game[$scope.getPlayer()].playground.lands===undefined){
            $scope.game[$scope.getPlayer()].playground.lands=[];
          }
          $scope.game[$scope.getPlayer()].playground.lands.push(card);
        }
        else if (card.types[0]==='artifact' || card.types[0]==='enchantment') {
          // check if array exists
          if ($scope.game[$scope.getPlayer()].playground.permanents===undefined){
            $scope.game[$scope.getPlayer()].playground.permanents=[];
          }
          $scope.game[$scope.getPlayer()].playground.permanents.push(card);
        }
        else {
          // check if array exists
          if ($scope.game[$scope.getPlayer()].graveyard===undefined){
            $scope.game[$scope.getPlayer()].graveyard=[];
          }
          $scope.game[$scope.getPlayer()].graveyard.push(card);
        }
      };

      // obsolete
      /*
      $scope.playCard=function(){
        // log/stack
        console.log('play card',$scope.card.name);

        // remove from hand
        $scope.game[$scope.getPlayer()].hand.splice($scope.cardIndex,1);

        if ($scope.card.types[0]==='creature' || $scope.card.types[0]==='planeswalker'){
          if ($scope.card.types[0]==='creature'){
            $scope.card.summoned=true;
          }
          console.log($scope.card);
          $scope.game[$scope.getPlayer()].playground.creatures.push($scope.card);
        }
        else if ($scope.card.types[0]==='land'){
          $scope.game[$scope.getPlayer()].playground.lands.push($scope.card);
        }
        else if ($scope.card.types[0]==='artifact' || $scope.card.types[0]==='enchantment') {
          $scope.game[$scope.getPlayer()].playground.permanents.push($scope.card);
        }
        else {
          $scope.game[$scope.getPlayer()].graveyard.push($scope.card);
        }
      };
      */

      $scope.defaultAction=function(card){
        console.log('default action',card.name);
        // todo if idle -> show card! and other defaults!
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
      $scope.loadGame();

      function initGame(){
        // init game
        if ($scope.game.new) {
          $scope.game.new=false;
          // todo add id to every card?!
          $scope.shuffleLibrary();
          // todo coin and ask for play or not
          $scope.drawFullHand();
          // todo ask for mulligan
          // GAME STARTS --> wait for player2
          // todo next turn? firstTurn? > priority!
          // $scope.nextTurn();
          // todo next phase?!
          // $scope.nextPhase();
        }
        $scope.idle=false;
      }

      // SAVE
      $scope.save=function(){
        $scope.idle=true;
        $scope.game.$save().then(function (){
          // load game and merge with array
          $scope.loadGame();
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
