'use strict';

describe('angular-analytics.google-analytics', function () {
  var noop = function () {};
  var analytics, timeout;
  var name = 'name';
  var properties = {
    category: 'category',
    label: 'label',
    value: 'value',
    noninteraction: 'noninteraction'
  };

  // Instanciate the module
  // Turn off autotracking
  beforeEach(function () {
    window._gaq = [];
    window.ga = noop;

    module('angular-analytics.google-analytics');
    module(function ($analyticsProvider) {
      $analyticsProvider.settings.autoTrackFirstPage = false;
    });
    inject(function($analytics, $timeout) {
      analytics = $analytics;
      timeout = $timeout;
    });
  });

  describe('Page Tracking', function () {

    it('should add to _gaq when a page is tracked', function () {
      expect(window._gaq.length).toEqual(0);
      analytics.trackPage('/foo');
      timeout.flush();
      expect(window._gaq.length).toEqual(1);
      expect(window._gaq[0][0]).toEqual('_trackPageview');
      expect(window._gaq[0][1]).toEqual('/foo');
    });

    it('should call ga when a page is tracker', function () {
      spyOn(window, 'ga');
      analytics.trackPage('/foo');
      timeout.flush();
      expect(window.ga).toHaveBeenCalled();
      expect(window.ga).toHaveBeenCalledWith('send', 'pageview', '/foo');
    });

  });

  describe('Event Tracking', function () {

    it('should add to _gaq when an event is tracked', function () {
      expect(window._gaq.length).toEqual(0);
      analytics.trackEvent(name, properties);
      timeout.flush();
      expect(window._gaq.length).toEqual(1);
      expect(window._gaq[0][0]).toEqual('_trackEvent');
      expect(window._gaq[0][1]).toEqual(properties.category);
      expect(window._gaq[0][2]).toEqual(name);
      expect(window._gaq[0][3]).toEqual(properties.label);
      expect(window._gaq[0][4]).toEqual(0); // value
      expect(window._gaq[0][5]).toEqual(true); // noninteraction
    });

    it('should call ga when an event is tracked', function () {
      spyOn(window, 'ga');
      analytics.trackEvent(name, properties);
      timeout.flush();
      expect(window.ga).toHaveBeenCalledWith(
        'send',
        'event',
        properties.category,
        name,
        properties.label,
        0,
        {nonInteraction: 1}
      );
    });

  });

});
