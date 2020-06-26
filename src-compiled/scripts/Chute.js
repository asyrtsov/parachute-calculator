function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ymaps.modules.define('Chute', [], function (provide) {
  var Chute =
  /**
   * @param {number} horizontalVel - Horizontal chute velocity, in m/sec.
   * @param {number} verticalVel - Vertical chute velocity, in m/sec.
   */
  function Chute(horizontalVel, verticalVel) {
    _classCallCheck(this, Chute);

    this.horizontalVel = horizontalVel;
    this.verticalVel = verticalVel;
  };

  provide(Chute);
});