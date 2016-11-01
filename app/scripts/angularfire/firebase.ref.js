angular.module('firebase.ref', ['firebase','firebase.config'])
  .factory('Ref', ['$window', 'FBapiKey', 'FBauthDomain', 'FBdatabaseURL', 'FBstorageBucket', function($window, FBapiKey, FBauthDomain, FBdatabaseURL, FBstorageBucket) {
    'use strict';
    // Initialize Firebase
    var config = {
      apiKey: FBapiKey,
      authDomain: FBauthDomain,
      databaseURL: FBdatabaseURL,
      storageBucket: FBstorageBucket
    };
    firebase.initializeApp(config);

    return firebase.database().ref();
  }]);
