(function (exports) {
  angular.module('fireadmin')
    .factory('$fa', ['FireAdminFactory', function (FireAdminFactory) {
      return function (url) {
        return FireAdminFactory(url);
      }
    }])
    /** Extend Fireadmin to includeFirebaseObject factory to include
    */
    .factory('FireAdminFactory', ['sessionService', function (sessionService) {
      return function (url) {
        exports.Fireadmin.prototype.$auth = function () {
          return $firebaseAuth(arguments);
        };
        exports.Fireadmin.prototype.$session = function () {
          return sessionService;
        };
        return new exports.Fireadmin(url);
      }
    }]);
})(window);
