'use strict';
angular.module('mtgJsApp')
  .factory('Decks', function($firebaseArray, $firebaseObject, Ref){
    var decksRef = Ref.child('decks');
    var decks = $firebaseArray(decksRef);

    var Decks = {
      getUserDecks: function(uid){
        return $firebaseArray(decksRef.child(uid));
      },
      getDeck: function(uid,deckId){
        return $firebaseObject(decksRef.child(uid).child(deckId));
      },
      all: decks
    };

    return Decks;
  });
