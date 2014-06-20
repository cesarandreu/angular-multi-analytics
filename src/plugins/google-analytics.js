(function(angular) {
  'use strict';

  angular.module('angular-multi-analytics.google-analytics', ['angular-multi-analytics'])
  .config(['$analyticsProvider', function ($analyticsProvider) {

    $analyticsProvider.registerPageTracker(function (path) {
      if (window._gaq) {
        window._gaq.push(['_trackPageview', path]);
      }
      if (window.ga) {
        window.ga('send', 'pageview', path);
      }
    });

    $analyticsProvider.registerEventTracker(function (ev) {
      ev = ev || {};
      ev.properties = ev.properties || {};

      if (ev.properties.value) {
        ev.properties.value = parseInt(ev.properties.value, 10) || 0;
      }

      if (window._gaq) {
        window._gaq.push([
          '_trackEvent',
          ev.properties.category,
          ev.name,
          ev.properties.label,
          ev.properties.value,
          !!ev.properties.noninteraction
        ]);
      }
      if (window.ga) {
        window.ga(
          'send',
          'event',
          ev.properties.category,
          ev.name,
          ev.properties.label,
          ev.properties.value,
          ev.properties.noninteraction ? {nonInteraction: 1} : undefined
        );
      }

    });

  }]);

})(window.angular);
