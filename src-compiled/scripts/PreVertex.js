var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ymaps.modules.define('PreVertex', ['Circle', 'Placemark', 'ChuteImage', 'Constant'], function (provide, Circle, Placemark, ChuteImage, Constant) {
  /**
   * Vertex consists of: Invisible Event Circle (it is used for catching
   * events for Vertex), Vertex Placemark for Output, Chute Placemark.
   */
  var PreVertex = function () {
    /**
     * @param {AppMap} map - Yandex.Map.
     * @param {number} scale
     * @param {number[] | null} coordinates - Yandex.Maps coordinates of center.
     */
    function PreVertex(map, scale) {
      var coordinates = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      _classCallCheck(this, PreVertex);

      this.map = map;

      var radius = 4;
      this.eventRadius = Constant.isMobile ? 6 * radius : 3 * radius;

      // Event Circle (invisible)
      this.eventCircle = new ymaps.Circle([coordinates, this.eventRadius * scale], {}, {
        fillOpacity: 0,
        strokeOpacity: 0,
        strokeWidth: 0,
        zIndex: 10
      });

      // Output Placemark
      this.heightPlacemark = new ymaps.Placemark(coordinates, { iconContent: '' }, { iconOffset: [0, -35], cursor: 'arrow', zIndex: 8 });

      // Image of chute which shows chute direction on the this.nextEdge
      this.chuteImage = new ChuteImage();

      this.chuteImageBack = new ChuteImage();

      this.hintContent = null;
      this.placemarkIsVisible = true;
      this.vertexIsOnMap = false;

      // remove standart map zoom for double click
      this.eventCircle.events.add('dblclick', function (e) {
        e.stopPropagation();
      });
    }

    /**
     * Set the same coordinates for Event Circle and Vertex Placemark.
     * @param {null | number[]} point
     */


    _createClass(PreVertex, [{
      key: 'setCoordinates',
      value: function setCoordinates(point) {
        this.eventCircle.geometry.setCoordinates(point);
        this.heightPlacemark.geometry.setCoordinates(point);
      }
    }, {
      key: 'setCalculator',
      value: function setCalculator(calculator) {
        this.chuteImage.setCalculator(calculator);
        this.chuteImageBack.setCalculator(calculator);
      }

      /**
       * Hiding Vertex.
       */

    }, {
      key: 'hide',
      value: function hide() {
        this.setCoordinates(null);
        //this.chuteImage.setCoordinates(null);
        this.chuteImage.hide();
        this.chuteImageBack.hide();
      }
    }, {
      key: 'setScale',
      value: function setScale(scale) {
        this.eventCircle.geometry.setRadius(this.eventRadius * scale);
      }
    }, {
      key: 'addToMap',
      value: function addToMap() {
        if (!this.vertexIsOnMap) {
          this.map.geoObjects.add(this.eventCircle);
          this.map.geoObjects.add(this.heightPlacemark);
          this.map.geoObjects.add(this.chuteImage);
          this.map.geoObjects.add(this.chuteImageBack);
          this.vertexIsOnMap = true;
        } else {
          console.warn('Vertex has already been added to Map!');
        }
      }
    }, {
      key: 'removeFromMap',
      value: function removeFromMap() {
        if (this.vertexIsOnMap) {
          this.map.geoObjects.remove(this.eventCircle);
          this.map.geoObjects.remove(this.heightPlacemark);
          this.map.geoObjects.remove(this.chuteImage);
          this.map.geoObjects.remove(this.chuteImageBack);
          this.vertexIsOnMap = false;
        } else {
          console.warn('Vertex has already been removed from Map!');
        }
      }
    }, {
      key: 'getCoordinates',
      value: function getCoordinates() {
        return this.eventCircle.geometry.getCoordinates();
      }
    }, {
      key: 'switchPlacemarkIsVisible',
      value: function switchPlacemarkIsVisible() {
        this.placemarkIsVisible = !this.placemarkIsVisible;
        this.heightPlacemark.options.set('visible', this.placemarkIsVisible);

        if (this.placemarkIsVisible) {
          this.map.geoObjects.remove(this.eventCircle);
          this.eventCircle.properties.set('hintContent', null);
          this.map.geoObjects.add(this.eventCircle);
        } else {
          this.eventCircle.properties.set('hintContent', this.hintContent);
        }
      }
    }, {
      key: 'printPlacemark',
      value: function printPlacemark(str) {
        this.heightPlacemark.properties.set('iconContent', '' + str);
      }
    }, {
      key: 'printHint',
      value: function printHint(str) {
        this.hintContent = '' + str;
        if (!this.placemarkIsVisible) {
          this.eventCircle.properties.set('hintContent', '' + this.hintContent);
        }
      }
    }, {
      key: 'printPlacemarkAndHint',
      value: function printPlacemarkAndHint(str) {
        this.printPlacemark(str);
        this.printHint(str);
      }
    }]);

    return PreVertex;
  }();

  provide(PreVertex);
});