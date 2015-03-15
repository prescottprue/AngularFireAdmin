# AngularFireAdmin

Angular integration for [Fireadmin Library](https://github.com/prescottprue/fireadmin).
## Getting Started
1. Include both the libraries in your `index.html` :

  ```html
  <!-- AngularJS -->
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.10/angular.min.js"></script>
  <!-- Firebase -->
  <script src="https://cdn.firebase.com/js/client/2.2.2/firebase.js"></script>
  <!-- FireAdmin -->
  <script src="https://s3.amazonaws.com/prescottprue/Fireadmin/current/fireadmin.min.js"></script>
  <!-- AngularFire -->
  <script src="https://cdn.firebase.com/libs/angularfire/1.0.0/angularfire.min.js"></script>
  <!-- AngularFireAdmin-->
  <script src="https://s3.amazonaws.com/prescottprue/angular-fireadmin/current/angular-fireadmin.min.js"></script>

  ```
  *Working on a bundled file*

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
    fa.session.getCurrentUser().then(function(account){
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
