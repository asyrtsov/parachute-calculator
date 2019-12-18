ymaps.modules.define('PreVertex', [
  'Circle',
  'Placemark',
  'templateLayoutFactory',
  'ChuteImage',
  'Constant'
],
function(provide, Circle, Placemark, templateLayoutFactory,
    ChuteImage, Constant) {
  /**
   * 'Abstract' class. You should initialize this.image before
   * using some methods.
   * Vertex consists of: Invisible Event Circle (it is used for catching
   * events for Vertex), Vertex Placemark for Output, Chute Placemark,
   * Link to Vertex Image (you should initialize it later).
   */
  class PreVertex {
    /**
     * @param {AppMap} map - Yandex.Map.
     * @param {null | number[]} coordinates - Yandex.Maps coordinates of center.
     */
    constructor(map, coordinates = null) {
      this.map = map;

      this.imageRadius = 4;
      this.eventRadius =
          Constant.isMobile ? 6*this.imageRadius : 3*this.imageRadius;

      // Event Circle (invisible)
      this.eventCircle = new ymaps.Circle(
          [coordinates, this.eventRadius], {}, {
            draggable: true,
            // vertex will be invisible
            fillOpacity: 0,
            strokeOpacity: 0,
            strokeWidth: 0,
            zIndex: 2
          });

      // Output Placemark
      this.heightPlacemark = new ymaps.Placemark(
        coordinates, {iconContent: ''}, {iconOffset: [0, -35], cursor: 'arrow'});

      // Vertex Image
      this.image = null;
      this.imageZIndex = 1;
      // Blue color
      this.color = '#0000FF';
      this.strokeColor = '#0000FF';

      // Image of chute which shows chute direction on the this.nextEdge
      this.chuteImage = new ChuteImage();

      this.placemarkHintContent = null;
      this.placemarkIsVisible = true;

      this.vertexIsOnMap = false;

      // remove standart map zoom for double click
      this.eventCircle.events.add('dblclick', function(e) {
        e.stopPropagation();
      });
    }


    /**
     * Set the same coordinates for Event Circle and Vertex Placemark.
     * this.image should be added before using this function.
     * @param {null | number[]} point
     */
    setCoordinates(point) {
      this.eventCircle.geometry.setCoordinates(point);
      this.heightPlacemark.geometry.setCoordinates(point);
      this.image.setCoordinates(point);
    }

    /**
     * this.image should be added before using this function.
     */
    scale(scale) {
      this.eventRadius = this.eventRadius * scale;
      this.eventCircle.geometry.setRadius(this.eventRadius);

      this.imageRadius = this.imageRadius * scale;
      this.image.scale(scale);
    }


    /**
     * this.image should be added before using this function.
     */
    addToMap() {
      if (!this.vertexIsOnMap) {
        this.map.geoObjects.add(this.eventCircle);
        this.map.geoObjects.add(this.heightPlacemark);
        this.map.geoObjects.add(this.image);
        this.map.geoObjects.add(this.chuteImage);
        this.vertexIsOnMap = true;
      } else {
        console.warn('Vertex has already been added to Map!');
      }
    }

    /**
     * this.image should be added before using this function.
     */
    removeFromMap() {
      if (this.vertexIsOnMap) {
        this.map.geoObjects.remove(this.eventCircle);
        this.map.geoObjects.remove(this.heightPlacemark);
        this.map.geoObjects.add(this.image);
        this.map.geoObjects.add(this.chuteImage);
        this.vertexIsOnMap = false;
      } else {
        console.warn('Vertex has already been removed from Map!');
      }
    }


    getCoordinates() {
      return this.eventCircle.geometry.getCoordinates();
    }

    /**
     * this.image should be added before using this function.
     */
    setColor(color) {
      this.color = color;
      this.image.options.set('fillColor', color);
    }

    /**
     * this.image should be added before using this function.
     */
    setStrokeColor(color) {
      this.strokeColor = color;
      this.image.options.set('strokeColor', color);
    }


    /**
     * @param {string} str - This will be printed in this.heightPlacemark
     */
    printPlacemark(str) {
      this.heightPlacemark.properties.set('iconContent', str);
    }

    printHint(str) {
      this.placemarkHintContent = str;

      if (!this.placemarkIsVisible) {
        this.eventCircle.properties.set('hintContent', str);
      }
    }
  }
  provide(PreVertex);
});