'use strict';
angular.module('mtgJsApp')
  .factory('Lobbies', function($firebaseArray, Ref){
    var ref = Ref.child('lobbies');
    var lobbies = $firebaseArray(ref);

    return lobbies;
  });
