'use strict';
angular.module('mtgJsApp')
  .factory('CardsService', function($http){

    var baseUrl = 'https://api.deckbrew.com/mtg';

    function allCards(){
      return $http.get(baseUrl + '/cards');
    }

    function listSet(set){
      return $http.get(baseUrl + '/cards?set='+set);
    }

    return {
      listSet: listSet,
      allCards: allCards
    };

  });
