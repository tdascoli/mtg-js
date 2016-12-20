'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('ModalChatCtrl', function ($scope, $uibModalInstance, $stateParams, Users, Messages, gameId, profile) {

    $scope.messages=Messages.forChannel(gameId);
    $scope.message='';

    $scope.getDisplayName = Users.getDisplayName;
    $scope.getEmail = Users.getEmail;

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

    $scope.closeModalCard = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
