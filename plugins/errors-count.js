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
    jserr: 0,

    // Add JS errors count before sending a beacon
    beforeBeacon: function() {
      BOOMR.addVar("jserr", impl.jserr);
      impl.jserr = 0;
    },

    // Cleanup after ourselves
    onBeacon: function() {
      BOOMR.removeVar("jserr");
    },
  };

  //
  // Public exports
  //
  BOOMR.plugins.JsErrorsCount = {
    init: function(config) {
      // Subscribe to any BOOMR events here.
      // Unless your code will explicitly be called by the developer
      // or by another plugin, you must to do this.
      BOOMR.subscribe("before_beacon", impl.beforeBeacon, null, impl);
      BOOMR.subscribe("beacon", impl.onBeacon, null, impl);
      BOOMR.utils.overwriteNative(
        BOOMR.window, "onerror",
        function BOOMR_plugins_js_errors_count_onerror(_message, _fileName, _lineNumber, _columnNumber, _error) {
          impl.jserr++;
          return false; // Do not prevent default
        });

      return this;
    },

    is_complete: function() {
      return true; // Always ready
    }
  };
}());
