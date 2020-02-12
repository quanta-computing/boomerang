/**
 * Quanta implementation of Speed Index
 */
(function() {
  // First, make sure BOOMR is actually defined.  It's possible that your plugin
  // is loaded before boomerang, in which case you'll need this.
  BOOMR = window.BOOMR || {};
  BOOMR.plugins = BOOMR.plugins || {};

  // A private object to encapsulate all your implementation details
  // This is optional, but the way we recommend you do it.
  var impl = {
    done: function(firstPaint) {
      var win = BOOMR.window;
      var doc = win.document;
      var GetElementViewportRect = function(el) {
        var intersect = false;
        if (el.getBoundingClientRect) {
          var elRect = el.getBoundingClientRect();
          intersect = {'top': Math.max(elRect.top, 0),
                           'left': Math.max(elRect.left, 0),
                           'bottom': Math.min(elRect.bottom, (win.innerHeight || doc.documentElement.clientHeight)),
                           'right': Math.min(elRect.right, (win.innerWidth || doc.documentElement.clientWidth))};
          if (intersect.bottom <= intersect.top ||
              intersect.right <= intersect.left) {
            intersect = false;
          } else {
            intersect.area = (intersect.bottom - intersect.top) * (intersect.right - intersect.left);
          }
        }
        return intersect;
      };
      var CheckElement = function(el, url) {
        if (url) {
          var rect = GetElementViewportRect(el);
          if (rect) {
            rects.push({'url': url,
                         'area': rect.area,
                         'rect': rect});
          }
        }
      };

      var GetRects = function() {
        var elements = doc.getElementsByTagName('*');
        var re = /url\(.*(http.*)\)/ig;
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i];
          var style = win.getComputedStyle(el);
          if (el.tagName == 'IMG') {
            CheckElement(el, el.src);
          }
          if (style['background-image']) {
            re.lastIndex = 0;
            var matches = re.exec(style['background-image']);
            if (matches && matches.length > 1)
              CheckElement(el, matches[1].replace('"', ''));
          }
          if (el.tagName == 'IFRAME') {
            try {
              var rect = GetElementViewportRect(el);
              if (rect) {
                var tm = done(el.contentWindow);
                if (tm) {
                  rects.push({'tm': tm,
                              'area': rect.area,
                              'rect': rect});
                }
            }
            } catch(e) {
            }
          }
        }
      };
      var GetRectTimings = function() {
        var timings = {};
        var requests = win.performance.getEntriesByType("resource");
        for (var i = 0; i < requests.length; i++)
          timings[requests[i].name] = requests[i].responseEnd;
        for (var j = 0; j < rects.length; j++) {
          if (!('tm' in rects[j]))
            rects[j].tm = timings[rects[j].url] !== undefined ? timings[rects[j].url] : 0;
        }
      };

      var CalculateVisualProgress = function() {
        var paints = {'0':0};
        var total = 0;
        for (var i = 0; i < rects.length; i++) {
          var tm = firstPaint;
          if ('tm' in rects[i] && rects[i].tm > firstPaint)
            tm = rects[i].tm;
          if (paints[tm] === undefined)
            paints[tm] = 0;
          paints[tm] += rects[i].area;
          total += rects[i].area;
        }
        var pixels = Math.max(doc.documentElement.clientWidth, win.innerWidth || 0) *
                     Math.max(doc.documentElement.clientHeight, win.innerHeight || 0);
        if (pixels > 0 ) {
          pixels = Math.max(pixels - total, 0) * pageBackgroundWeight;
          if (paints[firstPaint] === undefined)
            paints[firstPaint] = 0;
          paints[firstPaint] += pixels;
          total += pixels;
        }
        if (total) {
          for (var time in paints) {
            if (paints.hasOwnProperty(time)) {
              progress.push({'tm': time, 'area': paints[time]});
            }
          }
          progress.sort(function(a,b){return a.tm - b.tm;});
          var accumulated = 0;
          for (var j = 0; j < progress.length; j++) {
            accumulated += progress[j].area;
            progress[j].progress = accumulated / total;
          }
        }
      };
      var CalculateSpeedIndex = function() {
        if (progress.length) {
          SpeedIndex = 0;
          var lastTime = 0;
          var lastProgress = 0;
          for (var i = 0; i < progress.length; i++) {
            var elapsed = progress[i].tm - lastTime;
            if (elapsed > 0 && lastProgress < 1)
              SpeedIndex += (1 - lastProgress) * elapsed;
            lastTime = progress[i].tm;
            lastProgress = progress[i].progress;
          }
        } else {
          SpeedIndex = firstPaint;
        }
      };
      var rects = [];
      var progress = [];
      var SpeedIndex;
      var pageBackgroundWeight = 0.1;
      try {
        var navStart = win.performance.timing.navigationStart;
        GetRects();
        GetRectTimings();
        CalculateVisualProgress();
        CalculateSpeedIndex();
      } catch(e) {}
      console.log('SPEED INDEX');
      console.log(SpeedIndex);
      BOOMR.addVar('nm_si', SpeedIndex);
    },

    // Cleanup after ourselves
    onBeacon: function() {
      BOOMR.removeVar("nm_si");
    },

  };

  //
  // Public exports
  //
  BOOMR.plugins.SpeedIndex = {
    init: function(config) {
			if (!impl.initialized) {
        // Start calculate only when the first-paint has been found and fire the fp_ready event (from navtiming.js)
        BOOMR.subscribe("fp_ready", impl.done, null, impl);
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
