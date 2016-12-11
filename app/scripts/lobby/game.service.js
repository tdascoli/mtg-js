'use strict';
angular.module('mtgJsApp')
  .factory('Games', function($firebaseArray, Ref){
    var gamesRef = Ref.child('games');

    return {
      forLobby: function(gameId){
        return $firebaseArray(gamesRef.child(gameId));
      }
    };
  });
