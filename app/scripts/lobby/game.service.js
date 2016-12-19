'use strict';
angular.module('mtgJsApp')
  .factory('Games', function($firebaseObject, Ref){
    var gamesRef = Ref.child('lobby');

    return {
      getGame: function(gameId){
        return $firebaseObject(gamesRef.child(gameId));
      },
      connectionStatus: function(gameId){
        return $firebaseObject(gamesRef.child(gameId).child('connected'));
      },
      gameStatus: function(gameId){
        return $firebaseObject(gamesRef.child(gameId).child('status'));
      },
      getPlayer1: function(gameId){
        return $firebaseObject(gamesRef.child(gameId).child('player1'));
      },
      getPlayer2: function(gameId){
        return $firebaseObject(gamesRef.child(gameId).child('player2'));
      }
    };
  });
