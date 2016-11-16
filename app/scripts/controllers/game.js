'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:GameCtrl
 * @description
 * # GameCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('Game2Ctrl', function ($scope) {

    $scope.idle=false;

   /*
     #gameplay

     #card functions

     general
     - nr. of card in deck -> ID!
     - show detail
     - status of the game (name, players etc.)

     zone: battlefield
     - tap
     - tokens
     - ..dings +1/+1 zeugs...
     - attack / block
     - acivate abilities
     - ?

     zone: hand
     - play

     zone: graveyard
     - search/look up
     - "play"
     - trigger abilties
     - ?

     zone: exile
     - "morph" cards??
     - ?

     zone: library
     - search/look up
     - discard
     - shuffle?
     - play
     - -> hand
     - -> graveyard
     - -> exile?

     #game functions
     - untap all (legal?!)
     - shuffle library
     - start hand (7)
     - mulligan
     - draw
     - upkeep etc. -> game phases (attack etc)
     - player status (life etc.)
     - log
     - stack!
     - save! load?! pause/resume?!
     - chat
     - concede
     - deck
     - sideboard

     #what else?
     - ?

    */

  })
  .controller('GameCardCtrl', function ($scope) {

    $scope.idle=false;

    $scope.hand = 7;

    /*
     #gameplay

     #card functions

     general
     - nr. of card in deck -> ID!
     - show detail
     - status of the game (name, players etc.)

     zone: battlefield
     - tap
     - tokens
     - ..dings +1/+1 zeugs...
     - attack / block
     - acivate abilities
     - ?

     zone: hand
     - play

     zone: graveyard
     - search/look up
     - "play"
     - trigger abilties
     - ?

     zone: exile
     - "morph" cards??
     - ?

     zone: library
     - search/look up
     - discard
     - shuffle?
     - play
     - -> hand
     - -> graveyard
     - -> exile?

     #game functions
     - untap all (legal?!)
     - shuffle library
     - start hand (7)
     - mulligan
     - draw
     - upkeep etc. -> game phases (attack etc)
     - player status (life etc.)
     - log
     - stack!
     - save! load?! pause/resume?!
     - chat
     - concede
     - deck
     - sideboard

     #what else?
     - ?

     */

  });
