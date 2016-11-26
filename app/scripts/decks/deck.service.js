'use strict';
angular.module('mtgJsApp')
  .factory('Decks', function($firebaseArray, Ref){
    var ref = Ref.child('decks');
    var decks = $firebaseArray(ref);

    return decks;
  });
