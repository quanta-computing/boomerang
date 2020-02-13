// This code is run after all plugins have initialized
BOOMR.init({
  beacon_url: "http://localhost:5200/9c1633d1d083e3f7fc0c7e86a0ba1e23f3f67f6a80eafe10bd/beacon.gif",
  beacon_type: 'GET',
  beacon_disable_sendbeacon: true,
  instrument_xhr: true,
  autorun: false,
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
