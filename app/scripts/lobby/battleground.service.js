'use strict';
angular.module('mtgJsApp')
  .factory('BattlegroundService', function(lodash){

    var phases = [
      {
        phase: 'up',
        phaseName: 'Upkeep',
        disabled: false
      },
      {
        phase: 'dr',
        phaseName: 'Draw',
        disabled: false
      },
      {
        phase: 'm1',
        phaseName: 'Main, precombat',
        disabled: false
      },
      {
        phase: 'bc',
        phaseName: 'Before Combat',
        disabled: false
      },
      {
        phase: 'da',
        phaseName: 'Declare attackers',
        disabled: false
      },
      {
        phase: 'db',
        phaseName: 'Declare blockers',
        disabled: false
      },
      {
        phase: 'fs',
        phaseName: 'First strike',
        disabled: false
      },
      {
        phase: 'cd',
        phaseName: 'Combat damage',
        disabled: false
      },
      {
        phase: 'ec',
        phaseName: 'End Combat',
        disabled: false
      },
      {
        phase: 'm2',
        phaseName: 'Main, postcombat',
        disabled: false
      },
      {
        phase: 'et',
        phaseName: 'End of Turn',
        disabled: false
      },
      {
        phase: 'cl',
        phaseName: 'Cleanup',
        disabled: false
      }
    ];

    var cardtypes = [
      "artifact",
      "creature",
      "enchantment",
      "instant",
      "land",
      "phenomenon",
      "plane",
      "planeswalker",
      "scheme",
      "sorcery",
      "tribal",
      "vanguard"
    ];

    var allowedLandPerTurn=1;
    var playedLandThisTurn=0;

    function isType(types,type){
      if (lodash.findIndex(types,function(o) { return o===type; })>-1){
        return true;
      }
      return false;
    }

    function setLandPerTurn(amount){
      allowedLandPerTurn=amount;
    }

    function resetPlayedLand(){
      playedLandThisTurn=0;
    }

    function addPlayedLand(){
      playedLandThisTurn++;
    }

    // check if player can play spells or what kind of spells!
    // sorcery, creatures, land, artifacts etc. only in m1 and m2
    // instants and ... in all phases (except some combat)
    // same also for default action!
    // need global spell cast checker also to check if a land has already played!!
    // m1 = 2, m2 = 9
    function spellCastChecker(types,phase,turn){
      // karte ist ein instant
      if (isType(types,'instant')){
        return true;
      }
      // "main phasen" und eigener zug
      else if ( (phase==='m1' || phase==='m2') && turn){
        if (isType(types,'land') && playedLandThisTurn===allowedLandPerTurn){
          return false;
        }
        return true;
      }
      return false;
    }

    return {
      phases: phases,
      isType: isType,
      spellCastChecker: spellCastChecker,
      setLandPerTurn: setLandPerTurn,
      resetPlayedLand: resetPlayedLand,
      addPlayedLand: addPlayedLand
    };

  });
