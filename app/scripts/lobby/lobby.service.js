'use strict';
angular.module('mtgJsApp')
  .factory('Lobby', function($firebaseArray, Ref){
    var ref = Ref.child('lobby');
    var lobby = $firebaseArray(ref);

    return lobby;
  });
