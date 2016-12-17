'use strict';
angular.module('mtgJsApp')
  .factory('BattlegroundService', function(){

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

    return {
      phases: phases
    };

  });