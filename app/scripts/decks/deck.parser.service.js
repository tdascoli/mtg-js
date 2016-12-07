'use strict';
angular.module('mtgJsApp')
  .factory('DeckParserService', function(CardsService){

    var format = 'mtgo';
    var formats = {
      mtgo: 'MTGOnline',
      mws: 'MagicWorkstation',
      mtgs: 'MTGSalvation'
    };
    var deck = {
      main: [],
      sideboard: []
    };

    function parserMTGOnline(string) {
      // Iterating through lines
      string.split('\n').map(function(line) {

        // Trimming
        line = line.trim();
        if (!line)
          return false;

        if (~line.indexOf('//')) {

          // Commentary
          ['NAME', 'CREATOR', 'FORMAT'].map(function(meta) {
            if (~line.indexOf(meta)) {
              deck[meta.toLowerCase()] = line.split(meta + ' : ')[1];
            }
          });
        }
        else {
          if (line.slice(0, 3) !== 'SB:') {

            // Deck
            var splat = line.split(' ');

            deck.main.push({
              number: +splat[0],
              name: splat.slice(1).join(' ')
            });
          }
          else {

            // Sideboard
            var splat = line.split('SB:')[1].trim().split(' ');

            deck.sideboard.push({
              number: +splat[0],
              name: splat.slice(1).join(' ')
            });
          }
        }
      });

      return deck;
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
        if (!line)
          return false;

        // Retrieving card data
        var splat = line.split('x\t');

        var card = {
          number: +splat[0],
          name: splat[1]
        };

        // Dispatching
        if (!sideboardReached)
          deck.main.push(card);
        else
          deck.sideboard.push(card);
      });

      return deck;
    }

    function parserMagicWorkstation(string) {
      // Iterating through lines
      string.split('\n').map(function(line) {

        // Trimming
        line = line.trim();
        if (!line)
          return false;

        if (~line.indexOf('//')) {

          // Commentary
          ['NAME', 'CREATOR', 'FORMAT'].map(function(meta) {
            if (~line.indexOf(meta)) {
              deck[meta.toLowerCase()] = line.split(meta + ' : ')[1];
            }
          });
        }
        else {
          if (line.slice(0, 3) !== 'SB:') {

            // Deck
            var splat = line.split(' ');
            card_string = splat.slice(1).join(' '),
              matches = card_string.match(/\[(.+?)\] (.+?)$/);

            deck.main.push({
              number: +splat[0],
              set: matches[1],
              name: matches[2]
            });
          }
          else {

            // Sideboard
            var splat = line.split('SB:  ')[1].split(' '),
              card_string = splat.slice(1).join(' '),
              matches = card_string.match(/\[(.+?)\] (.+?)$/);

            deck.sideboard.push({
              number: +splat[0],
              set: matches[1],
              name: matches[2]
            });
          }
        }
      });

      return deck;
    }

    function lookupDeckCards(){
      // main
      var main=[];
      if (deck.main!==undefined){
        angular.forEach(deck.main, function(card){
          CardsService.lookupCard(card).success(function (lookup) {
            card.card=lookup;
            main.push(card);
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
          CardsService.lookupCard(card).success(function (lookup) {
            card.card=lookup;
            sideboard.push(card);
          })
            .error(function (error) {
              console.error(error);
            });
        });
      }
    }

    function parseDeck(string){
      if (formats[format] === undefined){
        return false;
      }
      else {
        if (format==='mtgo'){
          deck = parserMTGOnline(string);
        }
        else if (format==='mws'){
          deck = parserMTGSalvation(string);
        }
        else if (format==='mtgs'){
          deck = parserMagicWorkstation(string);
        }
        lookupDeckCards();
        return deck;
      }
    }

    return {
      formats: formats,
      parseDeck: parseDeck
    };

  });
