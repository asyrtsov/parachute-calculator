var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('AppMap', ['Map', 'control.ZoomControl', 'Constant', 'MenuButton', 'OutputElement', 'Arrow'], function (provide, Map, ZoomControl, Constant, MenuButton, OutputElement, Arrow) {
  var AppMap = function (_Map) {
    _inherits(AppMap, _Map);

    function AppMap() {
      _classCallCheck(this, AppMap);

      // Array of Dropzones and their coordinates.
      var dz = [{ name: 'Коломна!!!', mapCenter: [55.091289443603706, 38.917269584802675] }, { name: 'Пущино', mapCenter: [54.78929269708931, 37.64268598670033] }, { name: 'Ватулино', mapCenter: [55.663193308717396, 36.14121807608322] }, { name: 'Skydive Dubai', mapCenter: [25.089337722640472, 55.13236164813229] }];

      var _this = _possibleConstructorReturn(this, (AppMap.__proto__ || Object.getPrototypeOf(AppMap)).call(this, 'map', {
        center: dz[0].mapCenter,
        zoom: Constant.defaultZoom
      }, {
        suppressMapOpenBlock: true // remove button 'open in yandex maps'
      }));

      _this.dz = dz;
      _this.path = null;

      // view from space
      _this.setType('yandex#satellite');
      _this.cursors.push('arrow');
      _this.controls.remove('trafficControl');
      _this.controls.remove('zoomControl');
      var zoomControl = new ZoomControl({ options: {
          position: { right: 10, top: 105 },
          size: 'small'
        } });
      _this.controls.add(zoomControl);
      _this.controls.remove('geolocationControl');
      _this.controls.remove('fullscreenControl');

      _this.searchControl = _this.controls.get('searchControl');
      _this.searchControl.options.set('size', 'small');
      _this.searchControl.options.set('noPlacemark', true);
      _this.searchControl.options.set('noSelect', true);
      _this.searchControl.options.set('position', { top: 10, left: 45 });

      // Settings menu (ymaps.Button)
      var settingsButton = new MenuButton('Настройки', 'images/icon_menu.svg', '#settingsMenu', '#settingsMenuDarkScreen');
      _this.controls.add(settingsButton, { position: { top: 10, left: 10 } });

      // Output for Surface wind parameters (ymaps.Button)
      _this.windOutput = new OutputElement();
      _this.controls.add(_this.windOutput, { position: { bottom: 30, left: 10 } });

      // Wind arrow (Windsock)
      _this.arrow = new Arrow(_this.getCenter());
      _this.geoObjects.add(_this.arrow);

      // remove standart map zoom for double click
      _this.events.add('dblclick', function (e) {
        e.preventDefault();
      });

      _this.moveArrow = _this.moveArrow.bind(_this);
      _this.events.add('boundschange', _this.moveArrow);

      _this.searchControl.events.add('resultshow', function (e) {
        this.processResultShow(e);
      }.bind(_this));
      return _this;
    }

    /**
     * If arrow is out of the screen, we should
     * shift it to to the center of the screen.
     */


    _createClass(AppMap, [{
      key: 'moveArrow',
      value: function moveArrow() {
        var arrowGeoCoordinates = this.arrow.geometry.getCoordinates();
        var arrowPixelCoordinates = this.getPixelCoordinates(arrowGeoCoordinates);

        var _arrowPixelCoordinate = _slicedToArray(arrowPixelCoordinates, 2),
            x = _arrowPixelCoordinate[0],
            y = _arrowPixelCoordinate[1];

        if (x < 0 || y < 0 || x > screen.width || y > screen.height) {
          this.arrow.setCoordinates(this.getCenter());
        }
      }

      /**
       * @param {number[]} point - Geo object coordinates.
       * @returns {number[]} - Pixel coordinates.
       */

    }, {
      key: 'getPixelCoordinates',
      value: function getPixelCoordinates(point) {
        var projection = this.options.get('projection');
        return this.converter.globalToPage(projection.toGlobalPixels(point, this.getZoom()));
      }
    }, {
      key: 'getPixelDistance',
      value: function getPixelDistance(pointA, pointB) {
        var x = this.getPixelCoordinates(pointB)[0] - this.getPixelCoordinates(pointA)[0];
        var y = this.getPixelCoordinates(pointB)[1] - this.getPixelCoordinates(pointA)[1];
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      }
    }, {
      key: 'setPath',
      value: function setPath(path) {
        this.path = path;
      }

      /**
       * Processing Search result event.
       * You should set up this.path before using this function.
       */

    }, {
      key: 'processResultShow',
      value: function processResultShow(e) {
        this.path.clear();
        this.setZoom(Constant.defaultZoom);
        this.arrow.setCoordinates(this.getCenter());
        var index = e.get('index');
        var geoObjectsArray = this.searchControl.getResultsArray();
        var resultName = geoObjectsArray[index].properties.get('name');
        var newDz = {
          name: resultName,
          mapCenter: this.getCenter()
        };
        this.dz.push(newDz);
        $('#dz').append('<option>' + newDz.name + '</option>');
        $('#dz').children()[this.dz.length - 1].selected = true;
      }
    }]);

    return AppMap;
  }(Map);

  provide(AppMap);
});