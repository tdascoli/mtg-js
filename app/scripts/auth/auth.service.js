'use strict';
angular.module('mtgJsApp')

  .factory('Auth', ['$firebaseAuth', 'Ref', function($firebaseAuth) {
    var auth = $firebaseAuth();

    return auth;
  }])
  .factory('Users', function($firebaseArray, $firebaseObject, Ref){
    var usersRef = Ref.child('users');
    var users = $firebaseArray(usersRef);

    var connectedRef = firebase.database().ref('.info/connected');

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
      all: users,
      setOnline: function(uid) {
        var connected = $firebaseObject(connectedRef);
        var online = $firebaseArray(usersRef.child(uid + '/online'));

        connected.$watch(function () {
          if (connected.$value === true) {
            online.$add(true).then(function (connectedRef) {
              connectedRef.onDisconnect().remove();
            });
          }
        });
      }
      // setOffline??
    };

    return Users;
  });
