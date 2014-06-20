'use strict';

describe('angular-multi-analytics', function () {
  var noop = function () {};
  var spies = {};
  var analytics, rootScope, compile, timeout, location, analyticsProvider;

  // Instanciate the module
  beforeEach(function () {
    module('angular-multi-analytics');
  });

  describe('Default behavior', function() {
    beforeEach(function () {
      module(function ($analyticsProvider) {
        analyticsProvider = $analyticsProvider;
      });

      inject(function($analytics) {
        analytics = $analytics;
      });

    });

    it('should track pages', function() {
      expect(analyticsProvider.settings.autoTrackVirtualPages).toBe(true);
      expect(analytics.settings.autoTrackVirtualPages).toBe(true);
    });

    it('should track initial page view', function() {
      expect(analyticsProvider.settings.autoTrackFirstPage).toBe(true);
      expect(analytics.settings.autoTrackFirstPage).toBe(true);
    });

    it('should have a 1 second debounce', function() {
      expect(analyticsProvider.settings.debounce).toBe(1000);
      expect(analytics.settings.debounce).toBe(1000);
    });

    it('should have an empty basePath', function() {
      expect(analyticsProvider.settings.basePath).toBe('');
      expect(analytics.settings.basePath).toBe('');
    });

  });

  describe('Provider Internals', function () {
    beforeEach(function () {
      module(function ($analyticsProvider) {
        analyticsProvider = $analyticsProvider;
        analyticsProvider.settings.autoTrackFirstPage = false;
      });

      inject(function($analytics) {
        analytics = $analytics;
      });

    });

    it('should have a consume function', function () {
      expect(analyticsProvider.consume).toBeDefined();
    });

    it('should have a page and event tracker list', function () {
      expect(analyticsProvider.trackers).toBeDefined();
      expect(analyticsProvider.trackers.page.length).toBe(0);
      expect(analyticsProvider.trackers.event.length).toBe(0);
      expect(analyticsProvider.trackers).toEqual(jasmine.objectContaining({
        page: [],
        event: []
      }));
    });

    it('should have a pages and events cache list', function () {
      expect(analyticsProvider.cache).toBeDefined();
      expect(analyticsProvider.cache.pages.length).toBe(0);
      expect(analyticsProvider.cache.events.length).toBe(0);
      expect(analyticsProvider.cache).toEqual(jasmine.objectContaining({
        pages: [],
        events: []
      }));
    });

    it('should have a settings object', function () {
      expect(analyticsProvider.settings).toEqual(jasmine.objectContaining({
        debounce: 1000,
        autoTrackFirstPage: false,
        autoTrackVirtualPages: true,
        basePath: ''
      }));
    });

  });

  describe('Provider Instance', function () {
    beforeEach(function () {
      module(function ($analyticsProvider) {
        analyticsProvider = $analyticsProvider;
      });

      inject(function($analytics) {
        analytics = $analytics;
      });

    });

    it('should have a settings object with default values', function () {
      expect(analytics.settings).toEqual(jasmine.objectContaining({
        debounce: 1000,
        autoTrackFirstPage: true,
        autoTrackVirtualPages: true,
        basePath: '',
      }));
    });

    it('should have tracking functions', function () {
      expect(analytics.trackPage).toBeDefined();
      expect(analytics.trackEvent).toBeDefined();
    });

  });

  describe('Trackers', function () {
    beforeEach(function () {
      spies = {
        pageTracker: noop,
        anotherPageTracker: noop,
        eventTracker: noop,
        anotherEventTracker: noop
      };
      spyOn(spies, 'pageTracker');
      spyOn(spies, 'anotherPageTracker');
      spyOn(spies, 'eventTracker');
      spyOn(spies, 'anotherEventTracker');

      module(function($analyticsProvider) {
        analyticsProvider = $analyticsProvider;
        analyticsProvider.settings.autoTrackFirstPage = false;
        analyticsProvider.registerPageTracker(spies.pageTracker);
        analyticsProvider.registerPageTracker(spies.anotherPageTracker);
        analyticsProvider.registerEventTracker(spies.eventTracker);
        analyticsProvider.registerEventTracker(spies.anotherEventTracker);
      });

      inject(function($analytics, $rootScope, $timeout) {
        analytics = $analytics;
        rootScope = $rootScope;
        timeout = $timeout;
      });

    });

    it('should let you register multiple trackers', function () {
      expect(analyticsProvider.registerPageTracker).toBeDefined();
      expect(analyticsProvider.registerEventTracker).toBeDefined();
      expect(analyticsProvider.trackers.page.length).toBe(2);
      expect(analyticsProvider.trackers.event.length).toBe(2);
    });

    it('should call all page trackers when a page is tracked', function () {
      analytics.trackPage('foo');
      timeout.flush();
      expect(spies.pageTracker.calls.count()).toEqual(1);
      expect(spies.anotherPageTracker.calls.count()).toEqual(1);
      expect(spies.pageTracker).toHaveBeenCalledWith('foo');
      expect(spies.anotherPageTracker).toHaveBeenCalledWith('foo');
    });

    it('should call all event trackers when a page is tracked', function () {
      var name = 'foo';
      var prop = {bar: 'bar'};
      var obj = {
        name: name,
        properties: prop
      };

      analytics.trackEvent(name, prop);
      timeout.flush();
      expect(spies.eventTracker.calls.count()).toEqual(1);
      expect(spies.anotherEventTracker.calls.count()).toEqual(1);
      expect(spies.eventTracker).toHaveBeenCalledWith(obj);
      expect(spies.anotherEventTracker).toHaveBeenCalledWith(obj);
    });

  });

  describe('Routers', function () {
    beforeEach(function () {
      spies = {
        pageTracker: noop,
        anotherPageTracker: noop
      };
      spyOn(spies, 'pageTracker');
      spyOn(spies, 'anotherPageTracker');

      module(function($analyticsProvider) {
        analyticsProvider = $analyticsProvider;
        analyticsProvider.settings.autoTrackFirstPage = false;
        analyticsProvider.registerPageTracker(spies.pageTracker);
        analyticsProvider.registerPageTracker(spies.anotherPageTracker);
      });

      module({
        $route: true,
        $state: true
      });

      inject(function($analytics, $rootScope, $timeout, $location) {
        analytics = $analytics;
        rootScope = $rootScope;
        timeout = $timeout;
        location = $location;
      });

    });

    describe('ngRoute', function () {

      it('should track page views on $routeChangeSuccess if $route is injected', function () {
        expect(spies.pageTracker.calls.count()).toEqual(0);
        expect(spies.anotherPageTracker.calls.count()).toEqual(0);

        rootScope.$broadcast('$routeChangeSuccess');
        rootScope.$apply();
        timeout.flush();
        expect(spies.pageTracker.calls.count()).toEqual(1);
        expect(spies.anotherPageTracker.calls.count()).toEqual(1);
      });

      it('should track page views correctly', function () {
        location.path('/foo');
        rootScope.$broadcast('$routeChangeSuccess');
        timeout.flush();
        expect(spies.pageTracker).toHaveBeenCalledWith('/foo');
        expect(spies.anotherPageTracker).toHaveBeenCalledWith('/foo');
      });

      it('should concatenate basePath', function() {
        analytics.settings.basePath = '/bar';
        location.path('/foo');
        rootScope.$broadcast('$routeChangeSuccess');
        timeout.flush();
        expect(spies.pageTracker).toHaveBeenCalledWith('/bar/foo');
        expect(spies.anotherPageTracker).toHaveBeenCalledWith('/bar/foo');
      });

    });

    describe('ui-router', function () {

      it('should track page views on $stateChangeSuccess if $state is injected', function () {
        expect(spies.pageTracker.calls.count()).toEqual(0);
        expect(spies.anotherPageTracker.calls.count()).toEqual(0);

        rootScope.$broadcast('$stateChangeSuccess');
        rootScope.$apply();
        timeout.flush();
        expect(spies.pageTracker.calls.count()).toEqual(1);
        expect(spies.anotherPageTracker.calls.count()).toEqual(1);
      });

      it('should track page views correctly', function () {
        location.path('/foo');
        rootScope.$broadcast('$stateChangeSuccess');
        timeout.flush();
        expect(spies.pageTracker).toHaveBeenCalledWith('/foo');
        expect(spies.anotherPageTracker).toHaveBeenCalledWith('/foo');
      });

      it('should concatenate basePath', function() {
        analytics.settings.basePath = '/bar';
        location.path('/foo');
        rootScope.$broadcast('$routeChangeSuccess');
        timeout.flush();
        expect(spies.pageTracker).toHaveBeenCalledWith('/bar/foo');
        expect(spies.anotherPageTracker).toHaveBeenCalledWith('/bar/foo');
      });

    });

  });

  describe('analyticsOn Directive', function () {

    beforeEach(function () {
      spies = {
        eventTracker: noop,
        anotherEventTracker: noop
      };
      spyOn(spies, 'eventTracker');
      spyOn(spies, 'anotherEventTracker');

      module(function($analyticsProvider) {
        analyticsProvider = $analyticsProvider;
        analyticsProvider.registerEventTracker(spies.eventTracker);
        analyticsProvider.registerEventTracker(spies.anotherEventTracker);
      });

      inject(function($analytics, $rootScope, $timeout, $compile) {
        analytics = $analytics;
        rootScope = $rootScope;
        timeout = $timeout;
        compile = $compile;
        spyOn(analytics, 'trackEvent').and.callThrough();
      });
    });

    it('should not send the event until clicked', function () {
      var elem = angular.element('<div>').attr({
        'analytics-on': 'click',
        'analytics-event': 'DummyEvent',
        'analytics-category': 'DummyCategory'
      });

      expect(analytics.trackEvent).not.toHaveBeenCalled();
      expect(spies.eventTracker).not.toHaveBeenCalled();
      expect(spies.anotherEventTracker).not.toHaveBeenCalled();
      compile(elem)(rootScope);
      rootScope.$digest();

      elem.triggerHandler('click');
      timeout.flush();

      var name = 'DummyEvent';
      var prop = {category: 'DummyCategory'};
      var obj = {
        name: name,
        properties: prop
      };
      expect(analytics.trackEvent).toHaveBeenCalledWith(name, prop);
      expect(spies.eventTracker).toHaveBeenCalledWith(obj);
      expect(spies.anotherEventTracker).toHaveBeenCalledWith(obj);

      elem.triggerHandler('click');
      timeout.flush();
      expect(spies.eventTracker.calls.count()).toBe(2);
      expect(spies.anotherEventTracker.calls.count()).toBe(2);

    });


  });

});
