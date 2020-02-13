/**
 * Simple JS errors count plugin
 */
(function() {
  // First, make sure BOOMR is actually defined.  It's possible that your plugin
  // is loaded before boomerang, in which case you'll need this.
  BOOMR = window.BOOMR || {};
  BOOMR.plugins = BOOMR.plugins || {};

  // A private object to encapsulate all your implementation details
  // This is optional, but the way we recommend you do it.
  var impl = {
    // Add JS errors count before sending a beacon
    beforeBeacon: function() {
      BOOMR.addVar("jserr", BOOMR.jserr);
    },

    // Cleanup after ourselves
    onBeacon: function() {
      BOOMR.removeVar("jserr");
      BOOMR.jserr = 0;
    },
  };

  //
  // Public exports
  //
  BOOMR.plugins.JsErrorsCount = {
    init: function(config) {
      if (!impl.initialized) {
        BOOMR.subscribe("before_beacon", impl.beforeBeacon, null, impl);
        BOOMR.subscribe("beacon", impl.onBeacon, null, impl);
        impl.initialized = true;
      }
      return this;
    },

    is_complete: function() {
      return true;
    }
  };
}());
