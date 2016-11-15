'use strict';
angular.module('mtgJsApp')
  .factory('Messages', function($firebaseArray, Ref){
    var channelMessagesRef = Ref.child('channelMessages');

    return {
      forChannel: function(channelId){
        return $firebaseArray(channelMessagesRef.child(channelId));
      }
    };
  });
