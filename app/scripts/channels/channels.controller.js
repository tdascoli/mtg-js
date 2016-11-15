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
    .controller('ChannelsCtrl', function($scope, $state, Auth, Users, profile, channels){
      $scope.profile = profile;
      $scope.channels = channels;

      $scope.getDisplayName = Users.getDisplayName;
      $scope.getGravatar = Users.getGravatar;

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
