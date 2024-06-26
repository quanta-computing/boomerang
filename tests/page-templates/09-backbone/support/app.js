/* global Backbone,$,Handlebars */
var app = window.app || {};

app.TEMPLATES = {};

//
// Widget model
//
app.Widget = Backbone.Model.extend({
});

//
// Widgets collection
//
var Widgets = Backbone.Collection.extend({
  model: app.Widget,
  url: "/delay?delay=250&file=/pages/09-backbone/support/widgets.json"
});

app.widgets = new Widgets();

//
// Router
//
var AppRouter = Backbone.Router.extend({
  routes: {
    "widgets/:id": "widget",
    "empty": "empty",
    "*path":  "defaultRoute"
  },
  widget: function(id) {
    var model = app.widgets.get(id);
    var view = new app.WidgetView({ model: model });

    view.render();
  },
  defaultRoute: function() {
    var view = new app.HomeView();

    view.render();
  },
  empty: function() {
    var view = new app.EmptyView();

    view.render();
  }
});

app.Router = new AppRouter();

//
// View - Home
//
app.HomeView = Backbone.View.extend({
  el: $("#content"),
  initialize: function() {
  },
  renderTemplate: function() {
    var that = this;

    app.widgets.fetch({
      data: {
        rnd: Math.random()
      },
      reset: true,
      success: function() {
        //
        // Custom metrics and timers
        //
        window.custom_metric_1 = 11;
        window.custom_metric_2 = function() {
          return 22;
        };

        window.custom_timer_1 = 11;
        window.custom_timer_2 = function() {
          return 22;
        };

        if (typeof window.performance !== "undefined" &&
          typeof window.performance.mark === "function") {
          window.performance.mark("mark_usertiming");
        }

        var template = Handlebars.compile(app.TEMPLATES.home);

        var imgs = typeof window.backbone_imgs !== "undefined" ? window.backbone_imgs : [0];
        var hide_imgs = imgs[0] === -1;

        that.$el.html(template({
          imgs: imgs,
          hide_imgs: hide_imgs,
          widgets: app.widgets.toJSON(),
          rnd: Math.random()
        }));
      }
    });
  },
  render: function() {
    var that = this;

    if (!app.TEMPLATES.home) {
      $.get("support/home.html", function(template) {
        app.TEMPLATES.home = template;
        that.renderTemplate();
      }, "html");
    }
    else {
      // have renderTemplate run in a callback so 'route' fires first, so it
      // ensures the widgets XHR is tracked
      setTimeout(that.renderTemplate.bind(that), 0);
    }
  }
});

//
// View - Widget
//
app.WidgetView = Backbone.View.extend({
  el: $("#content"),
  initialize: function() {
  },
  renderTemplate: function() {
    var that = this;

    app.widgets.fetch({
      data: {
        rnd: Math.random()
      },
      success: function() {
        // these overwrite what was in the HTML
        window.custom_metric_1 = that.model.id;
        window.custom_metric_2 = function() {
          return 10 * that.model.id;
        };

        window.custom_timer_1 = that.model.id;
        window.custom_timer_2 = function() {
          return 10 * that.model.id;
        };

        var widget = app.widgets.get(that.model.id).toJSON();

        var template = Handlebars.compile(app.TEMPLATES.widgets);

        that.$el.html(template({
          widget: widget,
          rnd: Math.random(),
          carttotal: 11.11 * that.model.id
        }));
      }
    });
  },
  render: function() {
    var that = this;

    // have renderTemplate run in a callback so 'route' fires first, so it
    // ensures the widgets XHR is tracked
    setTimeout(function() {
      if (!app.TEMPLATES.widgets) {
        $.get("support/widget.html", function(template) {
          app.TEMPLATES.widgets = template;
          that.renderTemplate();
        }, "html");
      }
      else {
        that.renderTemplate();
      }
    }, 0);
  }
});

//
// View - Empty
//
app.EmptyView = Backbone.View.extend({
  el: $("#content"),
  initialize: function() {
  },
  render: function() {
    this.$el.html("Empty");
  }
});

//
// Boomerang snippet
//
var hookOptions = {};

if (window.backbone_route_wait) {
  hookOptions.routeChangeWaitFilter = window.backbone_route_wait;
}

if (window.backbone_route_filter) {
  hookOptions.routeFilter = window.backbone_route_filter;
}

var hadRouteChange = false;

app.Router.on("route", function() {
  hadRouteChange = true;
});

function hookBackboneBoomerang() {
  if (window.BOOMR && BOOMR.version) {
    if (BOOMR.plugins && BOOMR.plugins.Backbone) {
      BOOMR.plugins.Backbone.hook(app.Router, hadRouteChange, hookOptions);
    }

    return true;
  }
}

if (!window.disableBoomerangHook) {
  if (!hookBackboneBoomerang()) {
    if (document.addEventListener) {
      document.addEventListener("onBoomerangLoaded", hookBackboneBoomerang);
    }
    else if (document.attachEvent) {
      document.attachEvent("onpropertychange", function(e) {
        e = e || window.event;

        if (e && e.propertyName === "onBoomerangLoaded") {
          hookBackboneBoomerang();
        }
      });
    }
  }
}

//
// Start the app
//
window.backbone_start = function() {
  Backbone.history.start({
    root: "/pages/09-backbone/",
    pushState: window.backbone_html5_mode ? true : false
  });
};

if (!window.backbone_delay_startup) {
  window.backbone_start();
}

if (typeof window.backbone_nav_routes !== "undefined" &&
    Object.prototype.toString.call(window.backbone_nav_routes) === "[object Array]") {
  BOOMR.subscribe("beacon", function(beacon) {
    // only continue for non-early SPA beacons
    if (!BOOMR.utils.inArray(beacon["http.initiator"], BOOMR.constants.BEACON_TYPE_SPAS) ||
        typeof beacon.early !== "undefined") {
      return;
    }

    if (window.backbone_nav_routes.length > 0) {
      var nextRoute = window.backbone_nav_routes.shift();

      setTimeout(function() {
        app.Router.navigate(nextRoute, {
          trigger: true,
          replace: false  // use pushState instead of replaceState
        });
      }, 100);
    }
  });
}
