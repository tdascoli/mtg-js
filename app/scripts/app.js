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
          lobbies: function (Lobbies){
            return Lobbies.$loaded();
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
      .state('lobby.game', {
        url: '/{channelId}/game',
        templateUrl: 'views/lobby/game.html',
        controller: 'GameCtrl',
        resolve: {
          game: function($stateParams, Messages){
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          lobbyName: function($stateParams, channels){
            return '#'+channels.$getRecord($stateParams.channelId).name;
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
      // game
      .state('game', {
        url: '/game',
        menu: {
          name: 'solitaire game'
        },
        views: {
          content: {
            controller: 'Game2Ctrl',
            templateUrl: 'views/game.html'
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
