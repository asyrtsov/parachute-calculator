var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('WindVertex', ['Circle', 'templateLayoutFactory', 'PreVertex'], function (provide, Circle, templateLayoutFactory, PreVertex) {
  /**
   * WindVertex extends PrevVertex:
   * we add Vertex Image (Circle) and special layout for Vertex Placemark.
   */
  var WindVertex = function (_PreVertex) {
    _inherits(WindVertex, _PreVertex);

    /**
     * @param {AppMap} map
     */
    function WindVertex(map, height) {
      _classCallCheck(this, WindVertex);

      var scale = Math.pow(2, 16 - map.getZoom());

      var _this = _possibleConstructorReturn(this, (WindVertex.__proto__ || Object.getPrototypeOf(WindVertex)).call(this, map, scale));

      _this.map = map;
      _this.height = height;
      _this.scale = scale;

      _this.type = 'windVertex';

      _this.setScale = _this.setScale.bind(_this);
      _this.map.events.add('boundschange', _this.setScale);

      _this.imageRadius = 4;

      _this.image = new ymaps.Circle([null, _this.imageRadius * _this.scale], {}, {
        fillColor: '#0000FF', // Blue color
        strokeColor: '#00FF00', // Green color
        strokeWidth: 2,
        zIndex: 6
      });

      var MyIconLayout = ymaps.templateLayoutFactory.createClass('<div class="px-2 py-1 bg-success text-center rounded border d-inline-block"' + 'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' + '$[properties.iconContent]' + '</div>');

      _this.heightPlacemark.options.set('iconLayout', MyIconLayout);
      //this.heightPlacemark.options.set('zIndex', 7);

      _this.prevVertex = null;
      _this.nextVertex = null;
      _this.edge = null;

      _this.eventCircle.events.add('contextmenu', function (e) {
        e.stopPropagation();
        this.switchPlacemarkIsVisible();
      }.bind(_this));

      /*
      this.eventCircle.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.switchPlacemarkIsVisible();
      }.bind(this));  */
      return _this;
    }

    _createClass(WindVertex, [{
      key: 'setCoordinates',
      value: function setCoordinates(point) {
        _get(WindVertex.prototype.__proto__ || Object.getPrototypeOf(WindVertex.prototype), 'setCoordinates', this).call(this, point);
        this.image.geometry.setCoordinates(point);
      }

      /**
       * Hiding Vertex.
       */

    }, {
      key: 'hide',
      value: function hide() {
        _get(WindVertex.prototype.__proto__ || Object.getPrototypeOf(WindVertex.prototype), 'hide', this).call(this);
        this.image.geometry.setCoordinates(null);
        //this.setCoordinates(null);
        //this.chuteImage.setCoordinates(null);
      }
    }, {
      key: 'addToMap',
      value: function addToMap() {
        if (!this.vertexIsOnMap) {
          this.map.geoObjects.add(this.image);
        }
        _get(WindVertex.prototype.__proto__ || Object.getPrototypeOf(WindVertex.prototype), 'addToMap', this).call(this);
      }
    }, {
      key: 'removeFromMap',
      value: function removeFromMap() {
        if (this.vertexIsOnMap) {
          this.map.geoObjects.remove(this.image);
        }
        _get(WindVertex.prototype.__proto__ || Object.getPrototypeOf(WindVertex.prototype), 'removeFromMap', this).call(this);
      }
    }, {
      key: 'setScale',
      value: function setScale() {
        var scale = Math.pow(2, 16 - this.map.getZoom());
        _get(WindVertex.prototype.__proto__ || Object.getPrototypeOf(WindVertex.prototype), 'setScale', this).call(this, scale);
        this.scale = scale;
        this.image.geometry.setRadius(this.imageRadius * this.scale);
      }
    }, {
      key: 'setColor',
      value: function setColor(color) {
        this.image.options.set('fillColor', color);
      }
    }, {
      key: 'setStrokeColor',
      value: function setStrokeColor(color) {
        this.image.options.set('strokeColor', color);
      }
    }, {
      key: 'printPlacemarkAndHint',
      value: function printPlacemarkAndHint(str) {
        _get(WindVertex.prototype.__proto__ || Object.getPrototypeOf(WindVertex.prototype), 'printPlacemarkAndHint', this).call(this, str + '&nbsp;м');
      }
    }]);

    return WindVertex;
  }(PreVertex);

  provide(WindVertex);
});