(function(exports){
  "user strict";
  //Define fireadmin module that all services are contained within
  angular.module('fireadmin', ["firebase"])
  //[TODO] Look into how to use $window for this
  .value("Firebase", exports.Firebase)
  .value("Fireadmin", exports.Fireadmin)
})(window);