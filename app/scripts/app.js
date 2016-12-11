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
          name: 'home'
        },
        views: {
          content: {
            controller: 'MainCtrl',
            templateUrl: 'views/main.html'
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
              $state.go('home');
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
          }
        }
      })
      .state('lobby.create', {
        url: '/create',
        controller: 'LobbyCtrl',
        templateUrl: 'views/lobby/create.html'
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
          game: function($stateParams, Games){
            return Games.forLobby($stateParams.gameId).$loaded();
          },
          lobbyName: function($stateParams, Lobby){
            return '#'+Lobby.$getRecord($stateParams.gameId).name;
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
          }
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
            return Auth.$requireSignIn().then(function(auth){
              $state.go('account');
            }, function(error){
              return;
            });
          }
        }
      })
      .state('register', {
        url: '/register',
        views: {
          content: {
            controller: 'AuthCtrl',
            templateUrl: 'views/auth/register.html'
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
      // sandbox
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
              $state.go('home');
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
              $state.go('home');
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
              $state.go('home');
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
              $state.go('home');
            });
          }
        }
      })
      .state('decks.import', {
        url: '/decks/import',
        controller: 'DeckParserCtrl',
        templateUrl: 'views/decks/import.html'
      })
      // game
      .state('game', {
        url: '/game',
        menu: {
          name: 'game'
        },
        views: {
          content: {
            controller: 'Game2Ctrl',
            templateUrl: 'views/game.html'
          }
        }
      })
      .state('solitaire', {
        url: '/solitaire',
        menu: {
          name: 'solitaire game'
        },
        views: {
          content: {
            controller: 'BattlegroundCtrl',
            templateUrl: 'views/lobby/solitaire.html'
          }
        },
        resolve: {
          deck: function (Decks,Auth){
            return Auth.$requireSignIn().then(function(auth){
              //-KXvi7izzUe7ZZmuqt53 The Deck
              //-KYe0pVO2xZhXueb6D7g thomas-deck
              return Decks.getDeck(auth.uid,'-KXvi7izzUe7ZZmuqt53');
            });
          },
          /*
           decks: function (Decks,Auth){
           return Auth.$requireSignIn().then(function(auth){
           return Decks.getUserDecks(auth.uid);
           });
           },
           */
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
          }
        }
      });
  }]);

  app.run(function($rootScope, $state, Auth) {

    $rootScope.mobile = $.browser.mobile;

    $rootScope.$on('$stateChangeError', console.log.bind(console));

    $rootScope.logout=function(){
      $state.go('home');
      $rootScope.profile=undefined;
      Auth.$signOut();
    };
  });

}());
