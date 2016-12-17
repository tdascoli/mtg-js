'use strict';

/**
 * @ngdoc function
 * @name mtgJsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mtgJsApp
 */
angular.module('mtgJsApp')
  .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, lodash, CardsService) {
    // basic lands
    $scope.basiclandEditionIndex=undefined;
    $scope.basiclandEdition=undefined;
    $scope.basiclandCard=undefined;
    $scope.basiclands=undefined;

    $scope.basicland='0';
    $scope.amount=1;

    $scope.listBasiclands=function(){
      CardsService.listBasiclands().then(function (result) {
        $scope.basiclands=result.data;
        $scope.showBasicland();
      });
    };
    $scope.showBasicland=function(){
      $scope.basiclandCard=$scope.basiclands[$scope.basicland];
      $scope.basiclandEdition=$scope.basiclandCard.editions[0];
      $scope.basiclandEditionIndex=$scope.basiclandCard.editions[0].set_id+'-'+$scope.basiclandCard.editions[0].multiverse_id+'-'+$scope.basiclandCard.editions[0].number;
    };

    $scope.setBasiclandEdition=function(){
      var index = $scope.basiclandEditionIndex.split('-');
      var setId=index[0];
      var multiverseId=index[1];
      var number=index[2];
      $scope.basiclandEdition = lodash.find($scope.basiclandCard.editions, { 'set_id': setId, 'multiverse_id': parseInt(multiverseId), 'number': number });
    };

    $scope.addBasiclands=function(){
      $scope.basiclandCard.editions = new Array($scope.basiclandEdition);
      for (var i =0; i < $scope.amount; i++) {
        $scope.addCardByCard($scope.basiclandCard,true);
      }
    };

    $scope.closeModalCard = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });
