var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('Arrow', ['Placemark', 'templateLayoutFactory', 'Constant'], function (provide, Placemark, templateLayoutFactory, Constant) {
  /**
   * Wind Arrow (Yandex Maps API Placemark).
   * You can: rotate it, change its size and coordinates.
   */
  var Arrow = function (_Placemark) {
    _inherits(Arrow, _Placemark);

    function Arrow() {
      var coordinates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, Arrow);

      var arrowStartSize = 25;
      // radius of start active area for Arrow
      var arrowStartRadius = Constant.isMobile ? arrowStartSize : arrowStartSize / 2;

      var _this = _possibleConstructorReturn(this, (Arrow.__proto__ || Object.getPrototypeOf(Arrow)).call(this, [], {
        arrowClass: 'arrow',
        rotation: 0,
        size: arrowStartSize
      }, {
        draggable: true,
        iconLayout: templateLayoutFactory.createClass('<div class="$[properties.arrowClass]" ' + 'style="transform: rotate($[properties.rotation]deg);' + 'width: $[properties.size]px; height: $[properties.size]px;"/>'),
        iconShape: {
          type: 'Circle',
          coordinates: [arrowStartSize / 2, arrowStartSize / 2],
          radius: arrowStartRadius
        }
      }));

      _this.arrowStartSize = arrowStartSize;
      _this.arrowStartRadius = arrowStartRadius;

      if (coordinates != null) {
        _this.setCoordinates(coordinates);
      }

      _this.boundChange = _this.boundChange.bind(_this);
      return _this;
    }

    _createClass(Arrow, [{
      key: 'setCoordinates',
      value: function setCoordinates(coordinates) {
        this.geometry.setCoordinates(coordinates);
      }

      /**
       * Rotate arrow
       * @param {Number} angle - In degrees.
       */

    }, {
      key: 'rotate',
      value: function rotate(angle) {
        this.properties.set('rotation', -1 * angle);
      }

      /**
       * Arrow can have different size for different Zoom.
       */

    }, {
      key: 'changeSize',
      value: function changeSize(newZoom) {
        var size = Math.pow(2, newZoom - Constant.defaultZoom) * this.arrowStartSize;

        var shape = {
          type: 'Circle',
          coordinates: [size / 2, size / 2],
          radius: Math.pow(2, newZoom - Constant.defaultZoom) * this.arrowStartRadius
        };

        this.options.set('iconShape', shape);
        this.properties.set('size', size);
        // properties.set call rebuild of Placemark,
        // so, properties.set should stay after options.set
      }

      /**
       * If Yandex Maps Zoom is changed we will call this.changeSize() function.
       * @param {Event} e - Yandex Maps 'boundschange' event.
       */

    }, {
      key: 'boundChange',
      value: function boundChange(e) {
        var newZoom = e.get('newZoom'),
            oldZoom = e.get('oldZoom');
        if (newZoom != oldZoom) {
          this.changeSize(newZoom);
        }
      }
    }]);

    return Arrow;
  }(Placemark);

  provide(Arrow);
});