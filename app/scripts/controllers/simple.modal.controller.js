'use strict';

angular.module('mtgJsApp')
  .controller('SimpleModalCtrl', function ($scope, $uibModalInstance, action) {

    $scope.action=action;

    $scope.closeModalCard = function () {
      $uibModalInstance.close(true);
    };

    $scope.cancelModalCard = function () {
      $uibModalInstance.close(false);
    };
  });
