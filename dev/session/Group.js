(function(){
  'use strict';
  /**
   * Extend a Firebase reference to include Group functionality/methods
   * @param {Object} fbRef Firebase reference to turn into a "Group"
   * @returns Group Firebase Object
   */
  angular.module('fireadmin')
  .factory('GroupFactory', ['$firebaseObject', '$q', function($firebaseObject, $q){
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
  }])
  /**
   * Provide extended "Group" Firebase Object by ID
   * @param {string} gId - The Id/Key of the group to attach methods to
   * @returns Group Firebase Object
   */
  .factory('Group', ['GroupFactory', 'FBURL', function(GroupFactory, FBURL){
    return function(gId){
      if(gId){
        var groupRef = new Firebase(FBURL + '/groups/'+gId);
      } else {
        throw "Id needed for group factory";
      }
      return new GroupFactory(groupsRef);
    }
  }])
  /**
   * Extend a Firebase reference to include GroupsArray functionality/methods
   * @param {Object} fbRef Firebase reference to turn into a "GroupsArray"
   * @returns Groups Firebase Array
   */
  .factory('GroupsArray', ['$firebaseArray', '$q', 'GroupFactory', function($firebaseArray, $q, GroupFactory){
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
  }])
  /**
   * Get and Extend the list of groups associated with the currently logged in user with GroupsArray functionality/methods
   * @returns Groups Firebase Array
   */
  .factory('GroupsArrayFactory', ['Group', 'FBURL', function(GroupsArray, FBURL){
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
})();