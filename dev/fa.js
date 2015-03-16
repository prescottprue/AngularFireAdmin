(function (exports) {
  'use strict';
  angular.module('fireadmin')
    .factory('$fa', ['sessionService', function (sessionService) {
      exports.Fireadmin.prototype = {
        $auth: function () {

        },
        $session: function () {
        }
      }
      return function (url) {
        return new exports.Fireadmin(url);
      }
    }])
    /** Extend Fireadmin to includeFirebaseObject factory to include
    */
    .factory('FireAdminFactory', function () {
      return function (url) {
        return new exports.Fireadmin(url);
      }
    });
})(window);
