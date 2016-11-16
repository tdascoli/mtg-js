'use strict';
angular.module('mtgJsApp')
  .factory('Games', function($firebaseArray, Ref){
    var lobbyGamesRef = Ref.child('lobbyGames');

    return {
      forLobby: function(lobbyId){
        return $firebaseArray(lobbyGamesRef.child(lobbyId));
      }
    };
  });
