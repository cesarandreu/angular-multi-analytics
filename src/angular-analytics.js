(function(angular) {
  'use strict';

  angular.module('angular-analytics', [])

  .factory('analyticsDebounce', ['$timeout', '$q', function ($timeout, $q) {
    return function (func, wait, immediate) {
      var timeout;
      var deferred = $q.defer();
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) {
            deferred.resolve(func.apply(context, args));
            deferred = $q.defer();
          }
        };
        var callNow = immediate && !timeout;
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          deferred.resolve(func.apply(context,args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    };
  }])

  .provider('$analytics', [function () {
    var self = this;

    self.trackers = {
      page: [],
      event: []
    };

    self.cache = {
      pages: [],
      events: []
    };

    self.settings = {
      debounce: 1000,
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      basePath: ''
    };

    self.consume = function () {
      function consumer (item, consumers) {
        angular.forEach(consumers, function(consumer) {
          consumer(item);
        });
      }
      while (self.cache.pages.length) {
        consumer(self.cache.pages.pop(), self.trackers.page);
      }
      while (self.cache.events.length) {
        consumer(self.cache.events.pop(), self.trackers.event);
      }
    };

    self.registerPageTracker = function (fn) {
      self.trackers.page.push(fn);
    };

    self.registerEventTracker = function (fn) {
      self.trackers.event.push(fn);
    };

    self.$get = ['analyticsDebounce', function (analyticsDebounce) {

      var consumeCache = analyticsDebounce(self.consume, self.settings.delay);
      return {
        trackPage: function (path) {
          self.cache.pages.push(path);
          consumeCache();
        },
        trackEvent: function (event, properties) {
          self.cache.events.push({name: event, properties: properties});
          consumeCache();
        },
        settings: self.settings
      };
    }];

  }])

  .run(['$rootScope', '$location', '$analytics', '$injector', function($rootScope, $location, $analytics, $injector) {

    // autoTrackFirstPage
    if ($analytics.settings.autoTrackFirstPage) {
      $analytics.trackPage($analytics.settings.basePath + $location.url());
    }

    // autoTrackVirtualPages
    if ($analytics.settings.autoTrackVirtualPages) {

      // ngRoute
      if ($injector.has('$route')) {
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
          if (current && (current.$$route||current).redirectTo) {
            return;
          } else {
            $analytics.trackPage($analytics.settings.basePath + $location.url());
          }
        });
      }

      // ui-router
      if ($injector.has('$state')) {
        $rootScope.$on('$stateChangeSuccess', function () {
          $analytics.trackPage($analytics.settings.basePath + $location.url());
        });
      }

    }
  }])

  .directive('analyticsOn', ['$analytics', function ($analytics) {
    function isCommand(element) {
      return ['a:','button:','button:button','button:submit','input:button','input:submit'].indexOf(
        element.tagName.toLowerCase()+':'+(element.type||'')) >= 0;
    }

    function inferEventName(element) {
      if (isCommand(element)) {
        return element.innerText || element.value;
      } else {
        return element.id || element.name || element.tagName;
      }
    }

    function isProperty(name) {
      return name.substr(0, 9) === 'analytics' && ['On', 'Event'].indexOf(name.substr(9)) === -1;
    }

    return {
      restrict: 'A',
      scope: false,
      link: function ($scope, $element, $attrs) {
        var eventType = $attrs.analyticsOn || 'click';

        angular.element($element[0]).bind(eventType, function () {
          var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
          var properties = {};
          angular.forEach($attrs.$attr, function(attr, name) {
              if (isProperty(name)) {
                  properties[name.slice(9).toLowerCase()] = $attrs[name];
              }
          });

          $analytics.trackEvent(eventName, properties);
        });
      }
    };

  }]);

})(window.angular);
