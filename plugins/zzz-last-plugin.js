// This code is run after all plugins have initialized
BOOMR.init({
  beacon_url: window.QTABMR_BEACON_URL || window.QTABMR.QTABMR_BEACON_URL,
  beacon_type: 'GET',
  beacon_disable_sendbeacon: true,
  instrument_xhr: true,
  autorun: false,
  log: null,
  AutoXHR: {
    monitorFetch: true,
  },
  History: {
    auto: true
  },
  RT: {
    cookie: '_qta_rum',
    cookie_exp: 1800, // 30mn
  },
  Continuity: {
    monitorLongTasks: true,
    monitorPageBusy: true,
    monitorFrameRate: false,
    monitorInteractions: true,
    monitorStats: false,
    monitorLayoutShifts: true,
    afterOnload: true,
    afterOnloadMaxLength: 60000,
    waitAfterOnload: 10000,
    ttiWaitForFrameworkReady: false,
    ttiWaitForHeroImages: false,
    sendLog: false,
    sendTimeline: false,
  },
});
BOOMR.t_end = new Date().getTime();
