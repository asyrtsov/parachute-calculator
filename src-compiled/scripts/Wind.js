var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ymaps.modules.define('Wind', ['WindVertex'], function (provide, WindVertex) {

  /**
   * Wind at particular height.
   */
  var Wind = function () {
    /**
     * Wind at special height.
     * @param {number} value - In m/sec; value must be >= 0.
     * @param {number} angle - Angle between current wind and West wind; in degrees.
     * @param {(number | null)} height - In meters; height must be >= 0.
     */
    function Wind(value, angle, height, map) {
      _classCallCheck(this, Wind);

      this.value = value;
      this.setAngle(angle);

      this.prevWind = null;
      this.nextWind = null;

      this.vertex = new WindVertex(map, height);
      this.setHeight(height);
    }

    _createClass(Wind, [{
      key: 'setNextWind',
      value: function setNextWind(wind) {
        this.nextWind = wind;
        if (wind != null) {
          wind.prevWind = this;
        }
      }
    }, {
      key: 'setPrevWind',
      value: function setPrevWind(wind) {
        this.prevWind = wind;
        if (wind != null) {
          wind.nextWind = this;
        }
      }

      /**
       * @param {number} value - In m/sec; value must be >= 0.
       */

    }, {
      key: 'setValue',
      value: function setValue(value) {
        this.value = value;
      }

      /**
       * angle will be reduced to interval (-180, 180] degrees.
       * @param {number} angle
       */

    }, {
      key: 'setAngle',
      value: function setAngle(angle) {
        angle = Math.floor(angle);

        if (angle != -180) {
          // we want to differ -180 degree and 180 degree at wind menu scale
          if (angle >= 0) {
            angle = angle % 360;
          } else {
            // negative angle case
            angle = angle * -1;
            angle = angle % 360;
            angle = 360 - angle;
          }

          if (angle > 180) {
            angle -= 360;
          }
        }
        this.angle = angle;
      }

      /**
       * Set this.height and print it to Arrow Output Icon.
       * @param {(number | null)} height - In meters; height must be >= 0.
       */

    }, {
      key: 'setHeight',
      value: function setHeight(height) {
        this.height = height;
        this.vertex.height = height;
        this.vertex.printPlacemarkAndHint(Math.floor(height));
      }
    }, {
      key: 'getAngle',
      value: function getAngle() {
        return this.angle;
      }
    }, {
      key: 'getValue',
      value: function getValue() {
        return this.value;
      }
    }, {
      key: 'getHeight',
      value: function getHeight() {
        return this.height;
      }
    }, {
      key: 'toString',
      value: function toString() {
        var str = this.height == 0 ? 'Поверхностный ветер: ' : 'h=' + this.height + 'м';
        str += this.value + ' м/с, ' + this.getDirection();
        return str;
      }

      /**
       * Calculate wind coordinates in cartesian coordinate system.
       * @return {number[]} [vx, vy] - coordinates, in m/sec.
       */

    }, {
      key: 'getXY',
      value: function getXY() {
        var radiandirection = this.angle * (2 * Math.PI / 360);
        var vx = this.value * Math.cos(radiandirection);
        var vy = this.value * Math.sin(radiandirection);
        return [vx, vy];
      }

      /**
       * Get name of wind direction (E, EN, N, NW, W, WS, S, SE)
       */

    }, {
      key: 'getDirection',
      value: function getDirection() {
        var angleSwitch = Math.floor((this.angle + 180 + 22) / 45);
        var direction;

        switch (angleSwitch) {
          case 0:
            direction = "В";break;
          case 1:
            direction = "СВ";break;
          case 2:
            direction = "С";break;
          case 3:
            direction = "СЗ";break;
          case 4:
            direction = "З";break;
          case 5:
            direction = "ЮЗ";break;
          case 6:
            direction = "Ю";break;
          case 7:
            direction = "ЮВ";break;
          case 8:
            direction = "В";break;
        }

        return direction;
      }
    }]);

    return Wind;
  }();

  provide(Wind);
});