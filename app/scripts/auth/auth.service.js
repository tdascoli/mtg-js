'use strict';
angular.module('mtgJsApp')

  .factory('Auth', ['$firebaseAuth', 'Ref', function($firebaseAuth, Ref) {
    var auth = $firebaseAuth(firebase.auth());

    return auth;
  }])
  .factory('Users', function($firebaseArray, $firebaseObject, Ref){
    var usersRef = Ref.child('users');
    var users = $firebaseArray(usersRef);

    var Users = {
      getProfile: function(uid){
        return $firebaseObject(usersRef.child(uid));
      },
      getDisplayName: function(uid){
        return users.$getRecord(uid).name;
      },
      getEmail: function(uid){
        return users.$getRecord(uid).email;
      },
      all: users
    };

    return Users;
  });
