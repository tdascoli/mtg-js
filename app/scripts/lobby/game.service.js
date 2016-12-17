'use strict';
angular.module('mtgJsApp')
  .factory('Games', function($firebaseObject, Ref){
    var gamesRef = Ref.child('lobby');

    return {
      forLobby: function(gameId){
        return $firebaseObject(gamesRef.child(gameId));
      },
      connectionStatus: function(gameId){
        return $firebaseObject(gamesRef.child(gameId).child('connected'));
      }
    };
  });
