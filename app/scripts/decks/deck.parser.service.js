'use strict';
angular.module('mtgJsApp')
  .factory('DeckParserService', function(CardsService, lodash){

    var formats = {
      mtgo: 'MTGOnline',
      mws: 'MagicWorkstation',
      mtgs: 'MTGSalvation',
      mtgf: 'Forge'
    };

    var deck = {
      name: 'Imported Deck',
      main: [],
      sideboard: []
    };

    function parserMTGOnline(string) {
      // Iterating through lines
      string.split('\n').map(function(line) {

        // Trimming
        line = line.trim();
        if (!line) {
          return false;
        }

        if (~line.indexOf('//')) {

          // Commentary
          ['NAME', 'CREATOR', 'FORMAT'].map(function(meta) {
            if (~line.indexOf(meta)) {
              deck[meta.toLowerCase()] = line.split(meta + ' : ')[1];
            }
          });
        }
        else {
          var splat;
          if (line.slice(0, 3) !== 'SB:') {

            // Deck
            splat = line.split(' ');

            deck.main.push({
              number: +splat[0],
              name: splat.slice(1).join(' ')
            });
          }
          else {

            // Sideboard
            splat = line.split('SB:')[1].trim().split(' ');

            deck.sideboard.push({
              number: +splat[0],
              name: splat.slice(1).join(' ')
            });
          }
        }
      });
    }

    function parserMTGSalvation(string) {
      var deckMatch = string.match(/\[DECK\]([\s\S]*?)\[\/DECK]/),
        sideboardReached = false;

      // Iterating through deck
      deckMatch[1].split('\n').map(function(line) {

        line = line.trim();

        // Detecting sideboard start
        if (~line.toLowerCase().indexOf('sideboard')) {
          sideboardReached = true;
          return false;
        }

        // White line skipping
        if (!line) {
          return false;
        }

        // Retrieving card data
        var splat = line.split('x  ');

        var card = {
          number: +splat[0],
          name: splat[1]
        };

        // Dispatching
        if (!sideboardReached) {
          deck.main.push(card);
        }
        else {
          deck.sideboard.push(card);
        }
      });
    }

    function parserMagicWorkstation(string) {
      // Iterating through lines
      string.split('\n').map(function(line) {

        // Trimming
        line = line.trim();
        if (!line) {
          return false;
        }

        if (~line.indexOf('//')) {

          // Commentary
          ['NAME', 'CREATOR', 'FORMAT'].map(function(meta) {
            if (~line.indexOf(meta)) {
              deck[meta.toLowerCase()] = line.split(meta + ' : ')[1];
            }
          });
        }
        else {
          var splat,card_string,matches;
          if (line.slice(0, 3) !== 'SB:') {

            // Deck
            splat = line.split(' ');
            card_string = splat.slice(1).join(' ');
            matches = card_string.match(/\[(.+?)\] (.+?)$/);

            deck.main.push({
              number: +splat[0],
              set: matches[1],
              name: matches[2]
            });
          }
          else {

            // Sideboard
            splat = line.split('SB:  ')[1].split(' ');
            card_string = splat.slice(1).join(' ');
            matches = card_string.match(/\[(.+?)\] (.+?)$/);

            deck.sideboard.push({
              number: +splat[0],
              set: matches[1],
              name: matches[2]
            });
          }
        }
      });
    }

    function parserForge(string){
      var sideboardReached = false;
      var mainReached = false;

      // Iterating through lines
      string.split('\n').map(function(line) {
        // Trimming
        line = line.trim();

        // Detecting main start
        if (line==='[Main]') {
          mainReached = true;
          return false;
        }
        // Detecting sideboard start
        if (line==='[Sideboard]') {
          sideboardReached = true;
          return false;
        }

        // Detecting metadata start
        if (line==='[metadata]') {
          return false;
        }

        // metadata
        if (!sideboardReached && !mainReached){
          deck.name = line.split('Name=')[1];
        }
        else {
          // card
          var set = line.split('|');
          var number = set[0].substring(0, set[0].indexOf(' '));
          var name = set[0].substring(set[0].indexOf(' '));
          var card = {
            number: +number,
            set: set[1],
            name: name.trim()
          };

          if (mainReached && !sideboardReached){
            // push to main
            deck.main.push(card);
          }
          else if (sideboardReached) {
            // push to sideboard
            deck.sideboard.push(card);
          }
        }
      });
    }

    function lookupCards(){
      // main
      var main=[];
      if (deck.main!==undefined){
        angular.forEach(deck.main, function(card){
          if (card.name.indexOf('/')){
            card.name = card.name.split('/')[0];
          }

          CardsService.lookupCard(card.name).success(function (result) {
            var lookup;
            if (result.length>1){
              lookup = lodash.find(result, function(o) { return o.name === card.name; });
            }
            else {
              lookup = result[0];
            }

            if (card.set!==undefined){
              var edition=lodash.find(lookup.editions, { 'set_id': card.set });
              if (edition===undefined){
                edition=lookup.editions[0];
              }
              lookup.editions = new Array(edition);
            }
            else {
              lookup.editions = new Array(lookup.editions[0]);
            }

            for(var i=0;i<card.number;i++){
              main.push(lookup);
            }
          })
          .error(function (error) {
            console.error(error);
          });
        });
      }
      // sideboard
      var sideboard=[];
      if (deck.sideboard!==undefined){
        angular.forEach(deck.sideboard, function(card){
          if (card.name.indexOf('/')){
            card.name = card.name.split('/')[0];
          }

          CardsService.lookupCard(card.name).success(function (result) {
            var lookup;
            if (result.length>1){
              lookup = lodash.find(result, function(o) { return o.name === card.name; });
            }
            else {
              lookup = result[0];
            }

            if (card.set!==undefined){
              var edition=lodash.find(lookup.editions, { 'set_id': card.set });
              if (edition===undefined){
                edition=lookup.editions[0];
              }
              lookup.editions = new Array(edition);
            }
            else {
              lookup.editions = new Array(lookup.editions[0]);
            }

            for(var i=0;i<card.number;i++){
              sideboard.push(lookup);
            }
          })
          .error(function (error) {
            console.error(error);
          });
        });
      }

      deck.main=main;
      deck.sideboard=sideboard;
    }

    function parseDeck(format,string){
      if (formats[format] === undefined){
        return false;
      }
      else {
        if (format==='mtgo'){
          parserMTGOnline(string);
        }
        else if (format==='mws'){
          parserMagicWorkstation(string);
        }
        else if (format==='mtgs'){
          parserMTGSalvation(string);
        }
        else if (format==='mtgf'){
          parserForge(string);
        }
        lookupCards();
        return deck;
      }
    }

    return {
      deck: deck,
      formats: formats,
      parseDeck: parseDeck
    };

  });
