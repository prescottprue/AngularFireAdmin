(function(exports){
  "user strict";
  //Define fireadmin module that all services are contained within
  angular.module('fireadmin', [])
  //[TODO] Look into how to use $window for this
  .value("Firebase", exports.Firebase)
  .value("Firebase", exports.Fireadmin)

})(window);