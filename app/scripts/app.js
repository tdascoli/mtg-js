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
          },
          footer: {
            templateUrl: 'views/footer.html'
          }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          content: {
            controller: 'AuthCtrl',
            templateUrl: 'views/auth/login.html'
          },
          footer: {
            templateUrl: 'views/footer.html'
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
          },
          footer: {
            templateUrl: 'views/footer.html'
          }
        }
      })
      .state('account', {
        url: '/account',
        views: {
          content: {
            controller: 'AccountCtrl',
            templateUrl: 'views/account/account.html'
          },
          footer: {
            templateUrl: 'views/footer.html'
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
          },
          footer: {
            templateUrl: 'views/footer.html'
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
