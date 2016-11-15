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
    'angular-md5',
    'ui.router',
    'ui.gravatar',
    'firebase',
    'firebase.ref'
  ]);

  app.config(['$stateProvider','$urlRouterProvider',function ($stateProvider,$urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider
      .state('home', {
        url: '/home',
        views: {
          content: {
            controller: 'MainCtrl',
            templateUrl: 'views/main.html'
          }
        }
      })
      .state('chat', {
        url: '/chat',
        views: {
          content: {
            controller: 'MainCtrl',
            templateUrl: 'views/chat.html'
          }
        }
      })
      .state('channels', {
        url: '/channels',
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
      .state('game', {
        url: '/game',
        views: {
          content: {
            controller: 'GameCtrl',
            templateUrl: 'views/game.html'
          }
        }
      });
  }]);

  app.run(function($rootScope, $state, Auth) {
    $rootScope.$on('$stateChangeError', console.log.bind(console));

    $rootScope.logout=function(){
      $state.go('login');
      $rootScope.profile=undefined;
      Auth.$signOut();
    };
  });

}());
