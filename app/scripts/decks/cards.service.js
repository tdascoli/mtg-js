'use strict';
angular.module('mtgJsApp')
  .factory('CardsService', function($http, lodash, $sce){

    var baseUrl = 'https://api.deckbrew.com/mtg';
    var params = {
      search: {param:'name',value:''},
      format: '',
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

    function lookupCard(card){
      // format? set?
      return $http.get(baseUrl + '/cards?name='+card.name);
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
        if (params.search.param!=='' && params.search.value!=='') {
          if (filter !== '') {
            filter = filter + '&';
          }
          filter = filter + params.search.param + '=' + params.search.value;
        }
      }

      // formats
      if (params.search.format!==undefined && params.search.format!=='') {
        if (filter !== '') {
          filter = filter + '&';
        }
        filter = filter + 'format=' + params.search.format;
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

    function listBasiclands(){
      return $http.get(baseUrl + '/cards?supertype=basic');
    }

    function renderOracle(text){
      if (text!==undefined) {
        var regex = /{(.*?)}+/g;
        var oracle = text;
        var words = lodash.words(text, regex);

        angular.forEach(words, function (word) {
          var finalCost = word.replace('{', '').toLowerCase();
          finalCost = finalCost.replace('}', '').toLowerCase();
          // ausnahmen
          if (word==='{T}'){
            finalCost='tap';
          }
          else if (word.search('/')) {
            var manas = finalCost.split('/');
            finalCost=manas[0]+' ms-'+manas[1];
          }

          var wordElement = '<i class="ms ms-cost ms-' + finalCost + '"></i>';

          oracle = oracle.replace(word, wordElement);
        });

        return $sce.trustAsHtml(oracle);
      }
    }

    function renderCost(renderCost){
      var allCost='';
      if (renderCost!==undefined) {
        var costs = renderCost.split('{');
        angular.forEach(costs, function (cost) {
          if (cost !== '') {
            var finalCost = cost.replace('}', '').toLowerCase();

            // phyrexia/split mana
            if (cost.indexOf('/')>=0) {
              var manas = finalCost.split('/');
              // phyrexia
              if (manas[0]==='p' || manas[1]==='p') {
                finalCost = manas[0] + ' ms-' + manas[1];
              }
              else {
                // split
                finalCost = manas[0] + manas[1] + ' ms-split';
              }
            }
            else if (finalCost==='hw'){
              finalCost = 'w';
            }

            if (cost==='hw}'){
              allCost += '<span class="ms-half"><i class="ms ms-cost ms-shadow ms-' + finalCost + '"></i></span>';
            }
            else {
              allCost += '<i class="ms ms-cost ms-shadow ms-' + finalCost + '"></i>';
            }
          }
        });
      }
      return $sce.trustAsHtml(allCost);
    }

    function renderExpansion(set,rarity){
      if (set!==undefined){
        return 'ss-'+set.toLowerCase()+' ss-'+rarity;
      }
    }

    return {
      params: params,
      listSet: listSet,
      allCards: allCards,
      filterCards: filterCards,
      listBasiclands: listBasiclands,
      showCard: showCard,
      renderExpansion: renderExpansion,
      renderCost: renderCost,
      renderOracle: renderOracle,
      lookupCard: lookupCard
    };

  });
