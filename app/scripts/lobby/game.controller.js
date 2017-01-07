;(function () {
  'use strict';

  angular.module('mtgJsApp')
    .controller('GameCtrl', function($scope, $rootScope, $state, $stateParams, $uibModal, $q, lodash, BattlegroundService, CardsService, Users, Messages, connected, status, player1, player2, players){

      $scope.idle=true;
      $scope.init=true;
      $scope.solitaire=false;

      if ($state.includes('solitaire')){
        $scope.solitaire=true;
        console.log('starting solitaire game');
      }

      $scope.view={
        player1: '',
        player2: ''
      };
      /*
        phases default:
          me: m1, db, m2
          op: bc, db, et

        states:
        -coin:
          won: play, draw
          lost: play, mulligan
        -first draw:
          coin won: keep, mulligan
          coin lost: play, mulligan (?)
        -default: ok, end (turn)
        -play (pay mana): auto, cancel
        -da: ok, alpha strike (select creature to attack {op name} or select player/planeswalker you wish to attack)
          - select creature (or alpha strike): ok, call back
       */
      $scope.actions={
        primary: 'OK',
        secondary: 'End'
      };

      // todo check if online, when offline message!!
      // Users.setOnline($rootScope.profile.$id);

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
      // Player 1
      $scope.player1 = player1;
      // Player 2
      $scope.player2 = player2;

      // bind to scope
      if (!$scope.solitaire) {
        status.$bindTo($scope, 'status');
        player1.$bindTo($scope, 'player1');
        player2.$bindTo($scope, 'player2');
      }

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
      $scope.changePlayerView=function(view,player){
        $scope.view[player]=view;
      };
      $scope.toggleOpponentView=function(view){
        if ($scope.view[$scope.getOpponent()]===view){
          // toggle view
          view='';
        }
        $scope.changePlayerView(view,$scope.getOpponent());
      };
      $scope.getOpponentEmail=function(){
        var email = 'unknown';
        if ($scope.solitaire){
          email = $rootScope.profile.email;
        }
        else if ($scope.getOpponentObject().userId!==''){
          email = Users.getEmail($scope.getOpponentObject().userId);
        }
        return email;
      };
      $scope.getPlayer=function(){
        var player = $scope.players[$rootScope.profile.$id];
        if ($scope.solitaire){
          player = 'player1';
        }
        return player;
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
        if ($scope.getOpponent()==='player1' || $scope.solitaire){
          return lodash.merge($scope.player1,$scope.player);
        }
        return lodash.merge($scope.player2,$scope.player);
      };
      $scope.getObjectByPlayer=function(player){
        if ($scope.getPlayer()===player){
          return $scope.getPlayerObject();
        }
        return $scope.getOpponentObject();
      };
      $scope.getNextPlayer=function(){
        if ($scope.status.user===$scope.player1.name){
          return $scope.player2.name;
        }
        return $scope.player1.name;
      };
      $scope.getNextPrioPlayer=function(){
        if ($scope.status.priority===$scope.player1.name){
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

      //--- STACK --//
      $scope.hideStackList=false;
      // todo put in status!! or stack!!
      //$scope.status.trigger='idle';
      //$scope.trigger='idle';
      var triggers = {
        nextPhase: triggerNextPhase,
        playCard: triggerPlayCard,
        idle: function(){
          console.log('trigger is idle');
        }
      };

      $scope.toStack=function(trigger, card){
        /*
          stackObject = {
            trigger: 'triggerString',
            card: cardObject,
            player: 'player1 or player2'
            target: 'target maybe object can be a card or player or players... or color etc...?!'
          }

         */
        // todo stack object definition!! --> also player must be indicated...
        // todo to stack + add object to stack > play card, message, etc
        var stack = {
          trigger: trigger,
          card: card,
          player: $scope.getPlayer()
        };

        $scope.status.trigger=trigger;
        $scope.hideStackList=false;

        if (card!==false) {
          if ($scope.status.stack===undefined){
            $scope.status.stack=[];
          }
          $scope.status.stack.push(stack);
        }
        solveStack();
      };

      function resolveStack(){
        triggers[$scope.status.trigger]();
        $scope.status.trigger='idle';
      }
      function solveStack(){
        $scope.status.priority=$scope.getNextPrioPlayer();
      }
      $scope.showStack=function(){
        if ($scope.status.stack===undefined || $scope.status.stack.length===0){
          return 'Empty';
        }
        return $scope.status.stack.length+' to Resolve';
      };
      $scope.toggleStackList=function(){
        $scope.hideStackList=!$scope.hideStackList;
      };
      //--- END STACK --//

      //--- PHASES ---//
      $scope.phases=BattlegroundService.phases;

      function checkPhase(){
        // todo even if next phase disabled -> phase action!
        if ($scope.phases[$scope.status.phase].disabled){
          $scope.status.phase++;
          checkPhase();
        }
      }
      function doInitPhase(){
        var initPhase = $scope.getCurrentPhase();
        if (initPhase==='dr' && $scope.isCurrentPlayer()){
          // draw phase
          $scope.drawCardPhase();
        }
      }

      // watch status priority todo move this to log or stack...?
      $scope.$watchCollection('status.priority', function(newVal){
        if (newVal===$scope.status.user){
          resolveStack();
        }
      });

      function triggerNextPhase(){
        console.log('trigger next phase');
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
      }

      // todo rename to next...
      $scope.nextPhase=function(){
        if ($scope.status.trigger==='idle') {
          $scope.toStack('nextPhase',false);
        }
        else {
          solveStack();
        }
      };

      // todo upkeep !! not showing
      $scope.nextTurn=function(){
        console.log('next turn');
        BattlegroundService.resetPlayedLand();
        $scope.status.turn++;
        // todo next turn, new user! --> user.id
        $scope.status.priority=$scope.getNextPlayer();
        $scope.status.user=$scope.getNextPlayer();
        // todo upkeep
        $scope.upkeepPhase();
      };
      $scope.upkeepPhase=function(){
        console.log('upkeep phase');
        if ($scope.isCurrentPlayer()) {
          angular.forEach($scope.getPlayerObject().playground, function (playground) {
            angular.forEach(playground, function (card) {
              card.tapped = false;
              card.summoned = false;
            });
          });
        }
      };
      $scope.getCurrentPhase=function(){
        return $scope.phases[$scope.status.phase].phase;
      };
      $scope.getCurrentPhaseName=function(){
        return $scope.phases[$scope.status.phase].phaseName;
      };
      $scope.getCurrentPlayer=function(){
        if ($scope.player1.name===$scope.status.user){
          return 'player1';
        }
        return 'player2';
      };
      $scope.isCurrentPlayer=function(){
        if ($scope.getPlayerObject().name===$scope.status.user){
          return true;
        }
        return false;
      };
      $scope.hasPriority=function(){
        if ($scope.getPlayerObject().name===$scope.status.priority){
          return true;
        }
        return false;
      };
      $scope.togglePhase=function(index){
        $scope.phases[index].disabled=!$scope.phases[index].disabled;
      };
      //--- END PHASES ---//

      //--- DECK (Library, Graveyard, Exile, Hand etc.) ---//
      $scope.shuffleLibrary=function(){
        console.log($scope.getPlayer()+' shuffles library');
        $scope.getPlayerObject().library=lodash.shuffle($scope.getPlayerObject().library);
      };
      //--- DECK.HAND ---//
      $scope.drawFullHand=function(){
        console.log($scope.getPlayer()+' draws full hand');
        var fullHand=7;
        if ($scope.getPlayerObject().library.length<7){
          fullHand=$scope.getPlayerObject().library.length;
        }
        drawCards(fullHand);
      };

      $scope.drawMulligan=function(){
        var amount = $scope.getPlayerObject().hand.length;
        amount--;
        console.log($scope.getPlayer()+' draws a mulligan with '+amount+' cards');
        $scope.toLibrary($scope.getPlayerObject().hand,'bottom');
        $scope.getPlayerObject().hand=[];
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

      $scope.toLibrary=function(cards,where){
        if (where==='bottom'){
          $scope.getPlayerObject().library=lodash.concat($scope.getPlayerObject().library,cards);
        }
        else {
          $scope.getPlayerObject().library=lodash.concat(cards,$scope.getPlayerObject().library);
        }
      };

      function triggerPlayCard(){
        // todo CARD
        playCard($scope.status.stack[0].card,$scope.status.stack[0].player);
        // todo remove from stack...
        $scope.status.stack=[];
      }

      function playCard(card,player){
        console.log('play card', card.name);

        // todo card.types[1] == creature!! modal
        if (BattlegroundService.isType(card.types,'creature') || BattlegroundService.isType(card.types,'planeswalker')) {
          card.summoned = true;
          $scope.getObjectByPlayer(player).playground.creatures.push(card);
        }
        else if (BattlegroundService.isType(card.types,'land')) {
          BattlegroundService.addPlayedLand();
          $scope.getObjectByPlayer(player).playground.lands.push(card);
        }
        else if (BattlegroundService.isType(card.types,'artifact') || BattlegroundService.isType(card.types,'enchantment')) {
          $scope.getObjectByPlayer(player).playground.permanents.push(card);
        }
        else {
          $scope.getObjectByPlayer(player).graveyard.push(card);
        }
      }

      $scope.playCardByIndex=function(index){
        var card = $scope.getPlayerObject().hand[index];
        if ($scope.hasPriority() && BattlegroundService.spellCastChecker(card.types,$scope.getCurrentPhase(),$scope.isCurrentPlayer())) {
          // remove from hand
          $scope.getPlayerObject().hand.splice(index, 1);
          if (BattlegroundService.isType(card.types,'land')){
            // play card
            playCard(card,$scope.getPlayer());
          }
          else {
            console.log('trigger play card', card.name);
            // trigger play card
            $scope.toStack('playCard',card);
          }
        }
        else {
          console.log('no prio > showcard?! or not allowed');
        }
      };
      //--- END DECK ---//

      //--- ACTION ---//
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
      //--- END ACTION ---//

      // INIT
      function resetConnection(){
        initGame().then(function(){
          console.log('start game');
          $scope.init=false;
          $scope.idle=false;
        });
      }

      $scope.loadGame=function(){
        if (!$scope.solitaire) {
          $scope.connected[$scope.getPlayer()] = true;
          $scope.connected.$save().then(function () {
            console.log('connected', $scope.getPlayer());
            if ($scope.connected[$scope.getOpponent()]) {
              // both online
              $scope.connected.player1 = false;
              $scope.connected.player2 = false;
              $scope.connected.$save().then(function () {
                coinFlip();
              });
            }
          });
        }
        else {
          // coin flip... useless but the flow needs to be tested?!
          resetConnection();
        }

        // todo update player name?!
        // todo connect players
      };

      // watch connection -- init (todo obsolete)
      $scope.$watchCollection('connected', function(){
        if ($scope.connected[$scope.getOpponent()] && $scope.init){
          console.log('opponent connected ('+$scope.getOpponent()+')');
        }
      });

      // watch player first -- init
      $scope.$watchCollection('status.first', function(newVal){
        if (newVal!==undefined){
          console.log($scope.status.first+' has won the coin toss.');
          resetConnection();
        }
      });

      //=== LOAD GAME ===//
      $scope.loadGame();

      // todo make service!!!!
      function coinFlip() {
        console.log('flip a coin...');
        var player = 'player1';
        if (!$scope.solitaire){
          player = (Math.floor(Math.random() * 2) === 0) ? 'player1' : 'player2';
        }
        $scope.status.first=player;
      }

      function askPlay(){
        return $q(function(resolve){

          console.log('ask '+$scope.status.first+' if he wants play first.');
          var user = $scope.getOpponentObject().name;

          if ($scope.status.first===$scope.getPlayer() || $scope.solitaire){

            $uibModal.open({
              animation: true,
              templateUrl: 'views/lobby/modal/simple.html',
              size: 'xs',
              resolve: {
                action: function() {
                  return {ok:'Play',cancel:'Draw',message:'Play or Draw?'};
                }
              },
              controller: 'SimpleModalCtrl'
            }).result.then(function (play) {
              if (play){
                user = $scope.getPlayerObject().name;
              }
              $scope.status.priority=user;
              $scope.status.user=user;

              resolve(user);
            });
          }
          else {
            resolve(user);
          }
        });
      }

      function prepareLibrary(){
          var uid=1;
          if ($scope.getPlayer()==='player2'){
            uid=101;
          }

          for(var i=0;i<$scope.getPlayerObject().library.length;i++){
            $scope.getPlayerObject().library[i].uid=(i+uid);
          }

          $scope.shuffleLibrary();
      }

      function initGame(){
        return $q(function(resolve){
          console.log('init game');

          $scope.view[$scope.getPlayer()]='hand';

          if ($scope.getPlayerObject().init===undefined && ($scope.getPlayerObject().hand===undefined || $scope.getPlayerObject().hand.length===0)) {
            // todo coin and ask for play or not
            askPlay().then(function(){

              prepareLibrary();
              // draw 7 cards
              $scope.drawFullHand();

              $uibModal.open({
                animation: true,
                templateUrl: 'views/lobby/modal/mulligan.html',
                size: 'xs',
                scope: $scope,
                resolve: {
                  action: function() {
                    return {ok:'Keep',cancel:'Mulligan',message:'Keep or Mulligan?'};
                  }
                },
                controller: 'SimpleModalCtrl'
              }).result.then(function () {
                console.log($scope.getPlayer()+' plays with '+$scope.getPlayerObject().hand.length+' cards');

                $scope.status.turn=1;
                // todo start phase === m1?!
                $scope.status.phase=2;

                // GAME STARTS --> wait for player2
                $scope.getPlayerObject().init=true;
                resolve(true);
              });

            });
          }
          else {
            resolve(true);
          }
        });
      }
      //--- END INIT ---//

      //--- CHAT ---//
      $rootScope.getMessages=function () {
        return $scope.messages.length - $scope.readMessages;
      };
      $scope.messages=[];
      if (!$scope.solitaire) {
        $scope.messages = Messages.forChannel($stateParams.gameId);
      }
      $scope.readMessages=$scope.messages.length;
      $rootScope.chat=function(){
        $uibModal.open({
          animation: true,
          templateUrl: 'views/lobby/modal/chat.html',
          size: 'lg',
          resolve: {
            profile: function() {
              return $rootScope.profile;
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

      $scope.appendToEl = angular.element(document.querySelector('.navbar'));
    });

}());
