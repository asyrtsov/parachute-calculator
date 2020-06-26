/** @module Constant */
ymaps.modules.define('Constant', [],
function(provide) {

// Determine mobile or desktop case.
var isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  isMobile = true;
}
  /** These varialables are constants for app */
  var Constant = {
    defaultBaseHeight: 300,
    defaultStartHeight: 300,
    defaultFinalHeight: 0,
    defaultZoom: 16,
    defaultCalculationDirection: true,
    // We will not consider the cases when horizontal velocity
    // is more than maxChuteHorizontalVelocity
    maxChuteHorizontalVelocity: 100,  // wingsuit
    maxChuteVerticalVelocity: 50,  // free fall
    maxHeight: 15000,
    maxWindValue: 40,
    // If we will fly more than maxFlightTime, then
    // it is impossible to fly this path
    maxFlightTime: 3600, // 1 hour
    isMobile: isMobile
  }

  provide(Constant);
});