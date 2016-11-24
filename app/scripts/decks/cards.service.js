'use strict';
angular.module('mtgJsApp')
  .factory('CardsService', function($http){

    var baseUrl = 'https://api.deckbrew.com/mtg';
    var params = {
      filter: [],
      pagination: {page: 0}
    };

    function allCards(){
      return $http.get(baseUrl + '/cards');
    }

    function listSet(set){
      return $http.get(baseUrl + '/cards?set='+set);
    }

    function showCard(cardId){
      return $http.get(baseUrl + '/cards/'+cardId);
    }

    function doFilter(pagination){
      var filter='';

      // filter param
      angular.forEach(params.filter, function(value){
        if (filter!==''){
          filter=filter+'&';
        }
        filter=filter+value.param+'='+value.value;
      });

      // search param
      if (params.search!==undefined) {
        if (filter !== '') {
          filter = filter + '&';
        }
        filter = filter + params.search.param + '=' + params.search.value;
      }

      // pagination
      if (pagination) {
        if (filter !== '') {
          filter = filter + '&';
        }
        filter = filter + 'page=' + params.pagination.page;
      }
      else {
        params.pagination.page=0;
      }

      return filter;
    }

    function filterCards(pagination){
      var filter = doFilter(pagination);
      return $http.get(baseUrl + '/cards?'+filter);
    }

    return {
      params: params,
      listSet: listSet,
      allCards: allCards,
      filterCards: filterCards,
      showCard: showCard
    };

  });
