'use strict';
angular.module('mtgJsApp')
  .factory('Channels', function($firebaseArray, Ref){
    var ref = Ref.child('channels');
    var channels = $firebaseArray(ref);

    return channels;
  });
