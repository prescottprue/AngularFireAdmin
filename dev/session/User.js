(function(){
  'use strict';
  /**
   * Create a User that is a FirebaseObject that has been Extended to include user specific functionality
   */
  angular.module('fireadmin')
  .factory('UserFactory', ['$firebaseObject', function($firebaseObject){
    return $firebaseObject().$extend({
      getUsername:function(){
        return this.email;
      },
      toJson:function(){

      }
    })
  }])
  /**
  * Based on example given here https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-users-and-authentication
  */
  .factory("User", ['UserFactory', 'FireAdminFactory', function(UserFactory, FireAdminFactory){
    function User(){
      return angular.extend(this, UserFactory(arguments));
      // return new UserFactory.apply(this, arguments);
    }
    return function(userId){
      var userRef = FireAdminFactory.child('users').child(userId);
      // return new User(userRef); //
      return new UserFactory;
    }
  }]);
})();