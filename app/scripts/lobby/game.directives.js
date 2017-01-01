angular.module('mtgJsApp')
  .directive('mtgCardContainer', ['$timeout', function ($timeout) {
    'use strict';

    return {
      restrict: 'A',
      priority: 1100,
      link: function(scope, element, attrs) {

        var cards = attrs.mtgCardContainer;

        scope.$watchCollection(cards, function(){
          var width=element.outerWidth(true);
          //element.children().addClass('test');

          var container = element.children();
          var cards = element.children().children();

          console.log('mtg-card-container',width, $('.mtg-card img').outerWidth());

        });

        $timeout(function(){
          console.log('timeout', element.children().children().outerWidth());
        }, 0);

        scope.$on('$viewContentLoaded' ,function(){
          console.log('mtg-card', $('.mtg-card img').outerWidth());
        });
      }
    };
  }])
  .directive( 'elemReady', function( $parse ) {
    return {
      restrict: 'A',
      link: function( $scope, elem, attrs ) {
        elem.ready(function(){

          if(!$scope.$$phase) {
            $scope.$apply(function(){
              var func = $parse(attrs.elemReady);
              func($scope);
            })
          }
          else {

            var func = $parse(attrs.elemReady);
            func($scope);
          }

        })
      }
    }
  });
