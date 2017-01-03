;(function () {
  'use strict';

/**
 * @ngdoc overview
 * @name mtgJsApp
 * @description
 * # mtgJsApp
 *
 * Main module of the application.
 */
var app = angular.module('mtgJsApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ngLodash',
    'angular-md5',
    'angular.filter',
    'ui.router',
    'ui.router.menus',
    'ui.gravatar',
    'ui.bootstrap',
    'firebase',
    'firebase.ref'
  ]);

  app.config(['$stateProvider','$urlRouterProvider',function ($stateProvider,$urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider
      .state('home', {
        url: '/home',
        menu: {
          name: 'home',
          onAuth: 'show'
        },
        views: {
          content: {
            controller: 'MainCtrl',
            templateUrl: 'views/main.html'
          }
        },
        resolve: {
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      // chat
      .state('channels', {
        url: '/channels',
        menu: {
          name: 'channels',
          onAuth: 'show'
        },
        views: {
          content: {
            controller: 'ChannelsCtrl',
            templateUrl: 'views/channels/channels.html'
          }
        },
        resolve: {
          channels: function (Channels){
            return Channels.$loaded();
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      .state('channels.create', {
        url: '/create',
        controller: 'ChannelsCtrl',
        templateUrl: 'views/channels/create.html'
      })
      .state('channels.messages', {
        url: '/{channelId}/messages',
        templateUrl: 'views/channels/messages.html',
        controller: 'MessagesCtrl',
        resolve: {
          messages: function($stateParams, Messages){
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function($stateParams, channels){
            return '#'+channels.$getRecord($stateParams.channelId).name;
          }
        }
      })
      // lobby
      .state('lobby', {
        url: '/lobby',
        menu: {
          name: 'lobby',
          onAuth: 'show'
        },
        views: {
          content: {
            controller: 'LobbyCtrl',
            templateUrl: 'views/lobby/lobby.html'
          }
        },
        resolve: {
          lobby: function (Lobby){
            return Lobby.$loaded();
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('home');
            });
          },
          decks: function (Decks,Auth){
            return Auth.$requireSignIn().then(function(auth){
              return Decks.getUserDecks(auth.uid);
            });
          }
        }
      })
      .state('lobby.create', {
        url: '/create',
        controller: 'LobbyCtrl',
        templateUrl: 'views/lobby/create.html'
      })
      .state('lobby.join', {
        url: '/{gameId}/join',
        controller: 'GameJoinCtrl',
        templateUrl: 'views/lobby/join.html',
        resolve: {
          game: function($stateParams, Games){
            return Games.getGame($stateParams.gameId);
          }
        }

      })
      .state('lobby/game', {
        url: '/{gameId}/game',
        views: {
          content: {
            controller: 'GameCtrl',
            templateUrl: 'views/lobby/game.html'
          }
        },
        resolve: {
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          },
          connected: function($stateParams, Games){
            return Games.connectionStatus($stateParams.gameId);
          },
          status: function($stateParams, Games){
            return Games.gameStatus($stateParams.gameId);
          },
          player1: function($stateParams, Games){
            return Games.getPlayer1($stateParams.gameId);
          },
          player2: function($stateParams, Games){
            return Games.getPlayer2($stateParams.gameId);
          },
          players: function($stateParams, Games){
            return Games.getGame($stateParams.gameId).$loaded().then(function(game){
              var players=[];
              players[game.player1.userId]='player1';
              players[game.player2.userId]='player2';
              return players;
            });
          }
        },
        onExit: function(){
          // offline broadcast
          console.log('exit');
        }
      })
      // account
      .state('login', {
        url: '/login',
        views: {
          content: {
            controller: 'AuthCtrl',
            templateUrl: 'views/auth/login.html'
          }
        },
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireSignIn().then(function(){
              $state.go('account');
            }, function(error){
              return;
            });
          }
        }
      })
      .state('account', {
        url: '/account',
        menu: {
          name: 'account',
          onAuth: 'show'
        },
        views: {
          content: {
            controller: 'AccountCtrl',
            templateUrl: 'views/account/account.html'
          }
        },
        resolve: {
          auth: function($state, Users, Auth){
            return Auth.$requireSignIn().catch(function(){
              $state.go('login');
            });
          },
          profile: function(Users, Auth){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      // decks
      .state('decks', {
        url: '/decks',
        menu: {
          name: 'deck editor',
          onAuth: 'show'
        },
        views: {
          content: {
            controller: 'DeckCtrl',
            templateUrl: 'views/decks/decks.html'
          }
        },
        resolve: {
          decks: function (Decks,Auth){
            return Auth.$requireSignIn().then(function(auth){
              return Decks.getUserDecks(auth.uid);
            });
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      .state('decks/create', {
        url: '/decks/create',
        views: {
          content: {
            controller: 'DeckCtrl',
            templateUrl: 'views/decks/editor.html'
          }
        },
        resolve: {
          decks: function (Decks,Auth){
            return Auth.$requireSignIn().then(function(auth){
              return Decks.getUserDecks(auth.uid);
            });
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      .state('decks/create/imported', {
        url: '/decks/create/{importDeck}',
        views: {
          content: {
            controller: 'DeckCtrl',
            templateUrl: 'views/decks/editor.html'
          }
        },
        resolve: {
          decks: function (Decks,Auth){
            return Auth.$requireSignIn().then(function(auth){
              return Decks.getUserDecks(auth.uid);
            });
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      .state('decks/deck', {
        url: '/decks/{deckId}',
        views: {
          content: {
            controller: 'DeckCtrl',
            templateUrl: 'views/decks/editor.html'
          }
        },
        resolve: {
          decks: function (Decks,Auth){
            return Auth.$requireSignIn().then(function(auth){
              return Decks.getUserDecks(auth.uid);
            });
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          }
        }
      })
      .state('decks.import', {
        url: '/decks/import',
        controller: 'DeckParserCtrl',
        templateUrl: 'views/decks/import.html'
      })
      // solitaire
      .state('solitaire', {
        url: '/{deckId}/solitaire',
        views: {
          content: {
            controller: 'GameCtrl',
            templateUrl: 'views/lobby/game.html'
          }
        },
        resolve: {
          profile: function ($state, Auth, Users){
            return Auth.$requireSignIn().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function (profile){
                if(profile.name){
                  return profile;
                } else {
                  $state.go('account');
                }
              });
            }, function(error){
              $state.go('login');
            });
          },
          connected: function(){
            return { player1: true, player2: true };
          },
          status: function(){
            return {
              priority:'username',
              turn:0,
              phase:0,
              user:'username',
              stack:'Empty'
            };
          },
          player1: function($stateParams,Auth,Decks){
            return Auth.$requireSignIn().then(function(auth){
              return Decks.getDeck(auth.uid,$stateParams.deckId).$loaded().then(function(deck){
                return {
                  name: 'solitaire player 1',
                  userId: 'player1',
                  library: deck.main,
                  life: 20,
                  mana: 0
                };
              });
            });
          },
          player2: function(){
            return {
              name: 'solitaire player 2',
              userId: 'player2',
              library: [],
              life: 20,
              mana: 0
            };
          },
          players: function(){
            var players=[];
            players['player1']='player1';
            players['player2']='player2';
            return players;
          }
        }
      });
  }]);

  app.run(function($rootScope, $state, Auth) {

    $rootScope.mobile = $.browser.mobile;

    $rootScope.$on('$stateChangeError', console.log.bind(console));

    $rootScope.logout=function(){
      // delete online...?!
      $rootScope.profile=undefined;
      Auth.$signOut().then(function(){
        $state.go('login');
      });
    };
  });

  // TODO REMOVE WHEN RESOLVED --> UI-ROUTER
  /*
  app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
  }]);
  */
}());
