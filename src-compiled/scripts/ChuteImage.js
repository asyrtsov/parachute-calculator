var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('ChuteImage', ['Placemark', 'templateLayoutFactory', 'Constant'], function (provide, Placemark, templateLayoutFactory, Constant) {

  /**
   * Chute Image (Yandex Maps API Placemark).
   * You can: rotate it and change its coordinates.
   */
  var ChuteImage = function (_Placemark) {
    _inherits(ChuteImage, _Placemark);

    /**
     * @param {null | Number[]} coordinates
     */
    function ChuteImage() {
      var coordinates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, ChuteImage);

      var chuteStartSize = 25;
      // radius of start active area for Arrow
      var chuteStartRadius = Constant.isMobile ? chuteStartSize : chuteStartSize / 2;

      // If this.chuteDirection = true, chute flyes along wind,
      // else - opposite wind.
      var _this = _possibleConstructorReturn(this, (ChuteImage.__proto__ || Object.getPrototypeOf(ChuteImage)).call(this, coordinates, {
        chuteClass: 'chute',
        rotation: 0,
        size: chuteStartSize
      }, {
        iconLayout: templateLayoutFactory.createClass('<div class="$[properties.chuteClass]" style="transform: rotate($[properties.rotation]deg);' + 'width: $[properties.size]px; height: $[properties.size]px;"/>'),
        iconOffset: [-12, -12],
        iconShape: {
          type: 'Circle',
          coordinates: [chuteStartSize / 2, chuteStartSize / 2],
          radius: chuteStartRadius
        },
        zIndex: 7
      }));

      _this.chuteDirection = true;
      _this.calculator = null;

      _this.events.add('click', function (e) {
        e.stopPropagation(); // remove standart zoom for click
        this.processChuteImageClick(e);
      }.bind(_this));
      return _this;
    }

    _createClass(ChuteImage, [{
      key: 'setCalculator',
      value: function setCalculator(calculator) {
        this.calculator = calculator;
      }
    }, {
      key: 'processChuteImageClick',
      value: function processChuteImageClick() {
        //console.log('click');
        this.chuteDirection = !this.chuteDirection;
        if (this.calculator != null) {
          this.calculator.calculateHeight();
        }
      }

      /**
       * @param {Number[]} point
       */

    }, {
      key: 'setCoordinates',
      value: function setCoordinates(point) {
        this.geometry.setCoordinates(point);
      }
    }, {
      key: 'hide',
      value: function hide() {
        this.options.set('visible', false);
      }
    }, {
      key: 'show',
      value: function show() {
        this.options.set('visible', true);
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
       * angle in degrees.
       */

    }, {
      key: 'setPosition',
      value: function setPosition(pointA, pointB, angle) {
        this.setCoordinates([(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2]);
        this.rotate(angle);
      }
    }]);

    return ChuteImage;
  }(Placemark);

  provide(ChuteImage);
});