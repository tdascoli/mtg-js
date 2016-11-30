'use strict';
angular.module('mtgJsApp')
  .factory('Decks', function($firebaseArray, Ref){
    var decksRef = Ref.child('decks');
    var decks = $firebaseArray(decksRef);

    var Decks = {
      getUserDecks: function(uid){
        return $firebaseArray(decksRef.child(uid));
      },
      getDeck: function(uid,deckId){
        return $firebaseArray(decksRef.child(uid).child(deckId));
      },
      all: decks
    };

    return Decks;
  });
