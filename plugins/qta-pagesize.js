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
      console.log("Adding qps.cnt & qps.sz to beacon");
      var size = 0;
      var count = 0;
      for (const entry of this.records) {
        if (!entry.transferSize || entry.transferSize <= 0) {
          console.log("no transferSize for " + entry.name + ": " + entry.transferSize);
        }
        console.log("entry " + entry.name + ": " + entry.transferSize);
        count += 1;
        size += entry.transferSize;
      }
      console.log("qps.cnt=" + count + ", qps.sz=" + size);
      BOOMR.addVar("qps.cnt", count);
      BOOMR.addVar("qps.sz", size);

      this.records = []; // We flush our records queue
    },


    performanceObserverCallback: function(records) {
      console.log("GOT RECORDS");
      for (const entry of records.getEntries()) {
        this.records.push(entry);
      }
    },

    // Called after sending beacon
    onBeacon: function() {
      BOOMR.removeVar("qps.cnt");
      BOOMR.removeVar("qps.sz");
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