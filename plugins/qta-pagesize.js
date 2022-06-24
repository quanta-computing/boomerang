(function() {
  BOOMR = window.BOOMR || {};
	BOOMR.plugins = BOOMR.plugins || {};

  var impl = {
    init: function() {
      this.initialized = true;
      this.records = []
      this.observer = new PerformanceObserver(this.performanceObserverCallback.bind(this));
      this.observer.observe({type: 'resource', buffered: true});
    },

    // Called before beacon, we add our parameters to beacon
    done: function() {
      var size = 0;
      var count = 0;
      var tao_filtered_count = 0;
      for (const entry of this.records) {
        if (!entry.transferSize || entry.transferSize <= 0) {
          tao_filtered_count += 1;
        }
        count += 1;
        size += entry.transferSize;
      }
      BOOMR.addVar("qps.fcnt", tao_filtered_count);
      BOOMR.addVar("qps.cnt", count);
      BOOMR.addVar("qps.sz", size);
      BOOMR.addVar("qps.domcnt", document.getElementsByTagName('*').length); // TODO! how to deal with SPAs ?

      this.records = []; // We flush our records queue
    },


    performanceObserverCallback: function(records) {
      for (const entry of records.getEntries()) {
        this.records.push(entry);
      }
    },

    // Called after sending beacon
    onBeacon: function() {
      BOOMR.removeVar("qps.cnt");
      BOOMR.removeVar("qps.fcnt");
      BOOMR.removeVar("qps.sz");
      BOOMR.removeVar("qps.domsz");
    },
  };

  BOOMR.plugins.QtaPagesize = {
    init: function() {
      if (impl.initialized) {
        return;
      }

      impl.init();

      BOOMR.subscribe("before_beacon", impl.done, null, impl);
      BOOMR.subscribe("beacon", impl.onBeacon, null, impl);

      return this;
    },

    is_complete: function() {
      return true;
    },
  }
}());
