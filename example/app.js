angular.module('faApp', ['fireadmin'])
.constant('FBURL', "https://pyro-vcguy.firebaseio.com")
.controller('MainCtrl', function($scope, $fa, FBURL){
	console.log('MainCtrl');
	console.log('fa:',$fa(FBURL));
	var fa = $fa(FBURL);
});