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

      if (ev.value) {
        ev.value = parseInt(ev.value, 10) || 0;
      }

      if (window._gaq) {
        window._gaq.push([
          '_trackEvent',
          ev.category,
          ev.event,
          ev.label,
          ev.value,
          !!ev.noninteraction
        ]);
      }
      if (window.ga) {
        window.ga(
          'send',
          'event',
          ev.category,
          ev.event,
          ev.label,
          ev.value,
          ev.noninteraction ? {nonInteraction: 1} : undefined
        );
      }

    });

  }]);

})(window.angular);
