/** Session module
*/
goog.provide('faModule');
goog.provide('$fa');
goog.provide('fa.session');

/**
 * Session module.
 *
 * @export
 */
fa.session = angular.module('session',[])
.factory('sessionService', ['$q', function($q) {
  return function(fa){
    var auth = null;
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
}])
/**
 * fireadmin Angular Module.
 */
faModule = angular.module('fireadmin', [fa.session.name])

faModule.factory('$fa', ['sessionService', function($q, sessionService){
  return function(url) {
    var fa = new Fireadmin(url);
    return {
      fb: fa.ref,
      session:sessionService(fa)
    }
  }
}]);