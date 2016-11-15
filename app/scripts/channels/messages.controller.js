;(function () {
  'use strict';
  /**
   * @ngdoc function
   * @name ChannelsCtrl
   * @description
   * # ChannelsCtrl
   * Provides rudimentary account management functions.
   */
  angular.module('mtgJsApp')
    .controller('MessagesCtrl', function($scope, profile, channelName, messages){

      $scope.message = '';
      $scope.messages = messages;
      $scope.channelName = channelName;

      $scope.sendMessage = function (){
        if($scope.message.length > 0){
          $scope.messages.$add({
            uid: profile.$id,
            body: $scope.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          }).then(function (){
            $scope.message = '';
          });
        }
      };
    });

}());
