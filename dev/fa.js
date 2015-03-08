/** Session module
*/
goog.provide('faModule');
goog.provide('fa.session');
goog.provide('fa.session.User');
goog.provide('fa.session.Auth');
goog.provide('goog.object');

/**
 * Session module.
 *
 * @export
 */
fa.session = angular.module('session', ['firebase'])
fa.session.factory('sessionService', ['$q','$firebaseAuth', 'FireAdminFactory', function($q, $firebaseAuth, FireAdminFactory) {
  return function(fa){
    var fa = FireAdminFactory();
    var auth = $firebaseAuth(fa.ref);
    console.log('fa and auth', fa, auth);
    var account = null;
    return {
      signup: function(argSignupData) {
        var deferred = $q.defer();
        console.log('[sessionService] $signup called', argSignupData);
        fa.userSignup(argSignupData, function(userAccount) {
          console.log('signup + login successful:', userAccount);
          account = userAccount;
          deferred.resolve(userAccount);
        }, function(err) {
          console.warn('pyroSignup returned:', err);
          deferred.reject(err)
        });
        return deferred.promise;
      },
      login:function(argLoginData) {
        console.warn('[sessionService] $getUser called');
        var deferred = $q.defer();
        if(argLoginData == "object") {
          fa.login(argLoginData, function(returnedAccount){
            if(returnedAccount){
                account = returnedAccount;
                deferred.resolve(account);
              } else {
                console.log('got null for returnedAccount:', returnedAccount);
                deferred.reject();
              }
          });
        }
        //Handle 3rd Party provider as string
        else {
          var enabledProviders = [
            {name:'GitHub', value:'githubAuth()', lower:'github'},
            {name:'Twitter', value:'twitterAuth()', lower:'twitter'},
            {name:'Google', value:'googleAuth()', lower:'google'}
          ];
          var ind = goog.array.findIndex(enabledProviders, function(provider){ return argLoginData.toLowerCase() === provider.lower});
          if(ind = -1){
            console.error('Invalid Login Provider');
            deferred.reject({message:"Invalid login provider.", status:"INVALID_PARAMS"});
          }
          var provider = enabledProviders[ind];
          provider.value.apply(this, null);
        }
        return deferred.promise;
      },
      logout: function() {
        var deferred = $q.defer();
        auth = null;
        account = null;
        fa.ref.logout(function(){
          deferred.resolve();
        });
        return deferred.promise;
      },
      getAuth:function() {
        auth = fa.ref.getAuth();
        return auth;
      },
      authPromise:function(){
        var deferred = $q.defer();
        deferred.resolve(fa.ref.getAuth());
        return deferred.promise;
      },
      getCurrentUser: function() {
        var deferred = $q.defer();
        if(account != null) {
          deferred.resolve(account);
        }
        else {
          fa.getUser(function(returnedAccount){
            if(returnedAccount){
              account = returnedAccount;
              deferred.resolve(account);
            } else {
              console.log('got null for returnedAccount:', returnedAccount);
              deferred.reject(null);
            }
          });
        }
        return deferred.promise;
      }
    }
  }
}]);
/**
 * Create a User that is a FirebaseObject that has been Extended to include user specific functionality
 */
fa.session.factory('UserFactory', ['$firebaseObject', function($firebaseObject){
  return $firebaseObject().$extend({
    getUsername:function(){
      return this.email;
    },
    toJson:function(){

    }
  })
}]);
/**
* Based on example given here https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-users-and-authentication
*/
fa.session.factory("User", function(UserFactory, FireAdminFactory){
  function User(){
    return goog.object.extend(this, UserFactory(arguments))
    // return new UserFactory.apply(this, arguments);
  }
  return function(userId){
    var userRef = FireAdminFactory.child('users').child(userId);
    // return new User(userRef); //
    return new UserFactory
  }
});
/**
 * Extend a Firebase reference to include Group functionality/methods
 * @param {Firebase Reference} fbRef Firebase reference to turn into a "Group"
 * @returns Group Firebase Object
 */
fa.session.factory('GroupFactory', ['$firebaseObject', '$q', function($firebaseObject, $q){
  return $firebaseObject.$extend({
    getMessages:function(){
      var deferred = $q.defer();
      //[TODO] Apply Message Factory for each message
      return deferred.promise;
    },
    sendMessage:function(msg){
      var deferred = $q.defer();
      if(!_.has(msg, 'type')){msg.type = "text";}
      msg.createdAt = Firebase.ServerValue.TIMESTAMP;
      var msgRef = this.child('messages').push(msg);
      msgRef.set(function(error){
        if(error){
          console.error(error);
          deferred.reject(error);
        } else {
          deferred.resolve(msgRef);
        }
      });
      return deferred.promise;
    },
    shareListing:function(listing){
      var deferred = $q.defer();
      var listingMsg = {author:this.$getAuth().uid, listingId:listing.$id, type:"listing"};
      var self = this;
      this.sendMessage(listingMsg).then(function(newMsgRef){
        self.child("listings").push(listingMsg, function(err){
          if(err){
            deferred.reject(err);
          }
          deferred.resolve(self);
        });
      }, function(err){
        console.error('Error sharing listing:', error);
        deferred.reject(err);
      });
      return deferred.promise;
    },
    inviteByEmail:function(){
      //[TODO] Check to see if user exists
      //        If user does not exist -- Request email invite from server
      //        If user exists -- send invite to user
    }
  })
}]);
/**
 * Provide extended "Group" Firebase Object by ID
 * @param {string} gId - The Id/Key of the group to attach methods to
 * @returns Group Firebase Object
 */
fa.session.factory('Group', ['GroupFactory', 'FBURL', function(GroupFactory, FBURL){
  return function(gId){
    if(gId){
      var groupRef = new Firebase(FBURL + '/groups/'+gId);
    } else {
      throw "Id needed for group factory";
    }
    return new GroupFactory(groupsRef);
  }
}]);
/**
 * Extend a Firebase reference to include GroupsArray functionality/methods
 * @param {Firebase Reference} fbRef Firebase reference to turn into a "GroupsArray"
 * @returns Groups Firebase Array
 */
fa.session.factory('GroupsArray', ['$firebaseArray', '$q', 'GroupFactory', function($firebaseArray, $q, GroupFactory){
  return $firebaseArray.$extend({
    findGroup:function(findName){
      var deferred = $q.defer();
      this.$loaded().then(function(loadedArray){
        deferred.resolve(_.findWhere(loadedArray, {name:findName}));
      }, function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },
    $$added:function(snap){
      //Apply Group Firebase Object to each group
      return new GroupFactory(snap.ref());
    }
  })
}]);
/**
 * Get and Extend the list of groups associated with the currently logged in user with GroupsArray functionality/methods
 * @returns Groups Firebase Array
 */
fa.session.factory('GroupsArrayFactory', ['Group', 'FBURL', function(GroupsArray, FBURL){
  return function(){
    var fb = new Firebase(FBURL);
    if(fb.getAuth()){
      var groupsRef = fb.orderByChild('owner').equalTo(fb.getAuth().uid);
      return new GroupsArray(groupRef);
    } else {
      var errStr = 'Loggin is required to load groups';
      console.warn(errStr);
      return null;
    }
  }
}]);
/**
 * fireadmin Angular Module.
 */
faModule = angular.module('fireadmin', [fa.session.name])
.constant("FBURL", "https://pruvit.firebaseio.com")
.factory('$fa', ['sessionService', function(sessionService){
  Fireadmin.prototype = {
    $auth:function(){

    },
    $session:function(){
      return sessionService(this);
    },

  }
  return function(url){
    return new Fireadmin(url);
  }
}])
/** Extend Fireadmin to includeFirebaseObject factory to include
*/
.factory('FireAdminFactory', ['$firebaseObject', function($firebaseObject, FBURL){
    return new Fireadmin(FBURL);
    // var extendedAF = $firebaseObject.extend({
    //   $listByCurrentUser:function(){
    //
    //   }
    // });
    // console.log('returning extended fireadmin:', goog.object.extend(fa, extendedAF));
    // return goog.object.extend(fa, extendedAF(fa.ref));
}])
