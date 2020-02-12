// This code is run after all plugins have initialized
BOOMR.init({
  beacon_url: "http://localhost:4242/woidfaosdf092wefwef2cweafawf/beacon.gif",
  instrument_xhr: true,
  autorun: false,
  AutoXHR: {
    monitorFetch: true
  },
  History: {
    auto: true
  }
});
BOOMR.t_end = new Date().getTime();
