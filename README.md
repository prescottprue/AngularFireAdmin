# AngularFireAdmin

Angular integration for [Fireadmin Library](https://github.com/prescottprue/fireadmin).

>>>>>>> Switched fileName to config variable. Updated readme to reflect new file name of bundle file.
## Getting Started
1. Include the bundle file in your `index.html` :
  ```html
  <!-- Angular, Firebase, AngularFire, Fireadmin, and AngularFireAdmin Bundled together -->
  <script src="https://s3.amazonaws.com/prescottprue/angularfireadmin/current/angularfireadmin-bundle.js"></script>

  ```

2. Include `'fireadmin'` and `'fireadmin'` in your app dependencies:
  ```javascript
  angular.module('myApp', ['fireadmin'])
  ```
3. Create a controller using the `$fa` factory:

  ```javascript
  //Create account controller
  .controller('AccountCtrl', ['$scope','$fa', function($scope, $fa){
    //Create fireadmin object
    var fa = $fa("https://<your-app>.firebaseio.com");
    //Make use of promises
    fa.$session.getCurrentUser().then(function(account){
      console.log('Account for current user:', account);
      $scope.account = account;
    });
  }])
  ```

## Other Example Controllers

### Login Controller
  ```javascript
  .controller('LoginCtrl', ['$scope','sessionService', function($scope, sessionService){
    console.log('AccountCtrl');
    $scope.loginData = {};
    $scope.emailLogin = function(){
      sessionService.emailLogin($scope.loginData).then(function(){

      });
    }
  }])
  ```
### Signup Controller
  ```javascript
  .controller('SignupCtrl', ['$scope','$state','sessionService', function($scope, $state, sessionService){
    console.log('SignupCtrl');

    $scope.signupData = {};
    $scope.err = null;
    $scope.signup = function(){
      sessionService.signup($scope.signupData).then(function(account){
         $state.go('home');
      }, function(err){
        $scope.err = err;
      });
    }
  }])
  ```
## Planning

* Bundled File (Firebase, Angular, Fireadmin,)


*More coming soon...*
