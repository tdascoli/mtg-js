;(function () {
  'use strict';

  angular.module('mtgJsApp')
    .controller('GameCtrl', function($scope, $rootScope, $stateParams, $uibModal, lodash, BattlegroundService, CardsService, Messages, profile, connected, status, player1, player2, players){

      $scope.idle=true;
      $scope.init=true;

      // todo maybe loading different vars for different usage and save status!
      /*
       example:
       - player - library etc. former -scope.user (user independet?)
       - status
       - user informations such as deckId, userId, etc.
       */
      // Connection Status
      $scope.connected=connected;

      // Game Status
      $scope.status = status;
      status.$bindTo($scope, 'status');

      // Player 1
      $scope.player1 = player1;
      player1.$bindTo($scope, 'player1');

      // Player 2
      $scope.player2 = player2;
      player2.$bindTo($scope, 'player2');

      $scope.player = {
        library: [],
        hand: [],
        graveyard: [],
        exile: [],
        playground: {
          creatures: [],
          permanents: [],
          lands: []
        }
      };

      $scope.players=players;

      //--- USER ---//
      $scope.profile=profile;

      function resetConnection(){
        initGame();
        console.log('start game');
        $scope.init=false;
      }

      $scope.loadGame=function(){
        $scope.connected[$scope.getPlayer()]=true;
        $scope.connected.$save().then(function(){
          console.log('connected',$scope.getPlayer());
          if ($scope.connected[$scope.getOpponent()]){
            // both online
            $scope.connected.player1=false;
            $scope.connected.player2=false;
            $scope.connected.$save().then(function() {
              resetConnection();
            });
          }
        });



        // annahme, alle player sind offline
        // ich bin online
        // aderer user ist auch online
        // watch?! bis beide online...

        // todo update player name?!
        // todo connect players
        if ($scope.init){
          // init player
          /*
          $scope.connected[$scope.getPlayer()]=true;
          $scope.connected.$save().then(function (){
            console.log('connected');
            if ($scope.connected[$scope.getOpponent()]){
              resetConnection();
            }
          });
          */
        }

        //$scope.idle=false;
      };

      // watch connection -- init
      $scope.$watchCollection('connected', function(){
        if ($scope.connected[$scope.getOpponent()] && $scope.init){
          console.log('opponent connected ('+$scope.getOpponent()+')');
          resetConnection();
        }
      });

      $scope.getPlayer=function(){
        return $scope.players[$scope.profile.$id];
      };
      $scope.getPlayerObject=function(){
        if ($scope.getPlayer()==='player1'){
          return lodash.merge($scope.player1,$scope.player);
        }
        return lodash.merge($scope.player2,$scope.player);
      };
      $scope.getOpponent=function(){
        if ($scope.getPlayer()==='player1'){
          return 'player2';
        }
        return 'player1';
      };
      $scope.getOpponentObject=function(){
        if ($scope.getOpponent()==='player1'){
          return lodash.merge($scope.player1,$scope.player);
        }
        return lodash.merge($scope.player2,$scope.player);
      };
      $scope.getNextPlayer=function(){
        if ($scope.status.user===$scope.player1.name){
          return $scope.player2.name;
        }
        return $scope.player1.name;
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

      function doInitPhase(){
        var initPhase = $scope.getCurrentPhase();
        if (initPhase==='dr'){
          // draw phase
          $scope.drawCardPhase();
        }
      }

      $scope.nextPhase=function(){
        // nextPhase!! > user independent...
        $scope.status.phase++;
        // todo --> next Player
        if ($scope.status.phase===$scope.phases.length){
          $scope.status.phase=0;
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

        $scope.status.turn++;
        // todo next turn, new user! --> user.id
        $scope.status.user=$scope.getNextPlayer();
      };

      $scope.upkeepPhase=function(){
        console.log('upkeep');
        angular.forEach($scope.getPlayerObject().playground, function (playground) {
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
      $scope.shuffleLibrary=function(){
        console.log('shuffle library');
        $scope.getPlayerObject().library=lodash.shuffle($scope.getPlayerObject().library);
      };
      //--- DECK.HAND ---//
      $scope.drawFullHand=function(){
        console.log('draw full hand');
        var fullHand=7;
        if ($scope.getPlayerObject().library.length<7){
          fullHand=$scope.getPlayerObject().library.length;
        }
        drawCards(fullHand);
      };

      $scope.drawMulligan=function(){
        var amount = $scope.getPlayerObject().hand.length--;
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
        var hand = $scope.getPlayerObject().library.splice(0,amount);
        // check if array exists
        if ($scope.getPlayerObject().hand===undefined) {
          $scope.getPlayerObject().hand = [];
        }
        angular.forEach(hand, function(card){
          $scope.getPlayerObject().hand.push(card);
        });
      }

      $scope.playCardByIndex=function(index){
        // log/stack
        var card = $scope.getPlayerObject().hand[index];

        console.log('play card',card.name);

        // remove from hand
        $scope.getPlayerObject().hand.splice(index,1);

        if (card.types[0]==='creature' || card.types[0]==='planeswalker'){
          card.summoned=true;
          $scope.getPlayerObject().playground.creatures.push(card);
        }
        else if (card.types[0]==='land'){
          $scope.getPlayerObject().playground.lands.push(card);
        }
        else if (card.types[0]==='artifact' || card.types[0]==='enchantment') {
          $scope.getPlayerObject().playground.permanents.push(card);
        }
        else {
          $scope.getPlayerObject().graveyard.push(card);
        }
      };

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
        console.log('init game');
        // init game
        if ($scope.getPlayerObject().init===undefined) {
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

      //--- END DECK ---//

      //--- CHAT ---//
      $rootScope.getMessages=function () {
        return $scope.messages.length - $scope.readMessages;
      };
      $scope.messages=Messages.forChannel($stateParams.gameId);
      $scope.readMessages=$scope.messages.length;

      $rootScope.chat=function(){
        $uibModal.open({
          animation: true,
          templateUrl: 'views/lobby/modal/chat.html',
          size: 'lg',
          resolve: {
            profile: function() {
              return $scope.profile;
            },
            messages: function() {
              return $scope.messages;
            }
          },
          controller: 'ModalChatCtrl'
        }).closed.then(function(){
          $scope.readMessages=$scope.messages.length;
        });
      };
      //--- END CHAT ---//

      //--- CARDS ---//
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
