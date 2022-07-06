(function() {
  BOOMR = window.BOOMR || {};
	BOOMR.plugins = BOOMR.plugins || {};

  var impl = {
    init: function() {
      this.initialized = true;
      this.records = []
      this.lastDomCount = 0;
      this.observer = new PerformanceObserver(this.performanceObserverCallback.bind(this));
      this.observer.observe({type: 'resource', buffered: true});
    },

    // Called before beacon, we add our parameters to beacon
    done: function() {
      if (BOOMR.getVar('http.initiator') == 'interaction') {
        // We do not want to add data or tamper with buffered records for interaction beacons
        return;
      }
      var size = 0;
      var count = 0;
      var tao_filtered_count = 0;
      for (var i = 0; i < this.records.length; i++) {
        var entry = this.records[i];
        if (!entry.transferSize || entry.transferSize <= 0) {
          tao_filtered_count += 1;
        }
        count += 1;
        size += entry.transferSize;
      }
      BOOMR.addVar("qps.fcnt", tao_filtered_count);
      BOOMR.addVar("qps.cnt", count);
      BOOMR.addVar("qps.sz", size);

      var lastDomCount = this.lastDomCount || 0;
      this.lastDomCount = document.getElementsByTagName('*').length;
      if (BOOMR.getVar('http.initiator') == 'spa') {
        // This is "soft navigation" beacon, we want the diff with the last beacon
        BOOMR.addVar("qps.domcnt", Math.max(this.lastDomCount - lastDomCount, 0));
      } else {
        // This is a hard navigation beacon kind, send the current dom count
        BOOMR.addVar("qps.domcnt", this.lastDomCount);
      }
      this.records = []; // We flush our records queue
    },


    performanceObserverCallback: function(records) {
      var entries = records.getEntries();
      for (var i = 0; i < entries.length; i++) {
        this.records.push(entries[i]);
      }
    },

    // Called after sending beacon
    onBeacon: function() {
      BOOMR.removeVar("qps.cnt");
      BOOMR.removeVar("qps.fcnt");
      BOOMR.removeVar("qps.sz");
      BOOMR.removeVar("qps.domcnt");
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
