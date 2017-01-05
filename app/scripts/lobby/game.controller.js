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

      $scope.actions={
        primary: 'OK',
        secondary: 'End'
      };

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

      // todo check if online, when offline message!!
      Users.setOnline($rootScope.profile.$id);

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

      function resetConnection(){
        initGame();
        console.log('start game');
        $scope.init=false;
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
                resetConnection();
              });
            }
          });
        }
        else {
          resetConnection();
        }

        // todo update player name?!
        // todo connect players
      };

      // watch connection -- init
      $scope.$watchCollection('connected', function(){
        if ($scope.connected[$scope.getOpponent()] && $scope.init){
          console.log('opponent connected ('+$scope.getOpponent()+')');
          resetConnection();
        }
      });

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
        if (initPhase==='dr' && $scope.isCurrentPlayer()){
          // draw phase
          $scope.drawCardPhase();
        }
      }

      $scope.nextPhase=function(){
        // zuerst prio

        // anschliessend neue phase...

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
      };
      $scope.nextTurn=function(){
        console.log('next turn');
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
        if ($scope.player1.name===$scope.status.user){
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

      $scope.playCardByIndex=function(index){
        if ($scope.hasPriority()) {
          // log/stack
          var card = $scope.getPlayerObject().hand[index];

          console.log('play card', card.name);

          // remove from hand
          $scope.getPlayerObject().hand.splice(index, 1);

          // todo card.types[1] == creature!! modal
          if (card.types[0] === 'creature' || card.types[1] === 'creature' || card.types[0] === 'planeswalker') {
            card.summoned = true;
            $scope.getPlayerObject().playground.creatures.push(card);
          }
          else if (card.types[0] === 'land') {
            $scope.getPlayerObject().playground.lands.push(card);
          }
          else if (card.types[0] === 'artifact' || card.types[0] === 'enchantment') {
            $scope.getPlayerObject().playground.permanents.push(card);
          }
          else {
            $scope.getPlayerObject().graveyard.push(card);
          }
        }
        else {
          console.log('no prio > showcard?!');
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

      // todo make service!!!!
      function coinFlip() {
        return $q(function(resolve) {

          var player = 'player1';
          if (!$scope.solitaire){
            player = (Math.floor(Math.random() * 2) === 0) ? 'player1' : 'player2';
          }
          console.log(player+' has won the coin toss.');

          resolve(player);
        });
      }

      function askPlay(player){
        return $q(function(resolve){
          if (player===$scope.getPlayer()){
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
                resolve($scope.getPlayerObject().name);
              }
              else {
                resolve($scope.getOpponentObject().name);
              }
            });
          }
          else {
            resolve($scope.getOpponentObject().name);
          }
        });
      }

      function initGame(){
        console.log('init game');
        $scope.view[$scope.getPlayer()]='hand';
        // init game todo --> CALLBACKS!
        if ($scope.getPlayerObject().init===undefined) {
          // todo coin and ask for play or not
          coinFlip().then(function(player){

            askPlay(player).then(function(user){
              $scope.status.priority=user;
              $scope.status.user=user;
              console.log(user+' plays first.');

              $scope.shuffleLibrary();
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
                $scope.idle=false;
              });

            });

          });
        }
      }

      //--- END DECK ---//

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
    });

}());
