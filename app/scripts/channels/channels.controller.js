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
    .controller('ChannelsCtrl', function($scope, $state, Auth, Users, channels){
      $scope.channels = channels;

      $scope.getDisplayName = Users.getDisplayName;
      $scope.getEmail = Users.getEmail;

      $scope.logout = function(){
        Auth.$signOut();
        $state.go('home');
      };

      $scope.newChannel = {
        name: ''
      };

      $scope.createChannel = function(){
        $scope.channels.$add($scope.newChannel).then(function(ref){
          $state.go('channels.messages', {channelId: ref.key()});
        });
      };
    });

}());
