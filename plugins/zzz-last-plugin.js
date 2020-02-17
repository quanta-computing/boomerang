// This code is run after all plugins have initialized
BOOMR.init({
  beacon_url: window.QTABMR_BEACON_URL,
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
  }
});
BOOMR.t_end = new Date().getTime();
