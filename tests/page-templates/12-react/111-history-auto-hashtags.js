/* eslint-env mocha */
/* global BOOMR_test */

describe("e2e/12-react/111-history-auto-hashtags", function() {
  var tf = BOOMR.plugins.TestFramework;
  var t = BOOMR_test;

  var pathName = window.location.pathname;

  it("Should have sent three beacons", function(done) {
    this.timeout(10000);
    t.ensureBeaconCount(done, 3);
  });

  it("Should have sent the first beacon as http.initiator = spa_hard", function() {
    assert.equal(tf.beacons[0]["http.initiator"], "spa_hard");
  });

  it("Should have sent all subsequent beacons as http.initiator = spa", function() {
    for (var i = 1; i < 2; i++) {
      assert.equal(tf.beacons[i]["http.initiator"], "spa");
    }
  });
});
