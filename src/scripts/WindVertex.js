ymaps.modules.define('WindVertex', [
  'Circle',
  'templateLayoutFactory',
  'PreVertex',
],
function(provide, Circle, templateLayoutFactory, PreVertex) {
  /**
   * WindVertex extends PrevVertex:
   * we add Vertex Image (Circle) and special layout for Vertex Placemark.
   */
  class WindVertex extends PreVertex {
    /**
     * @param {AppMap} map
     */
    constructor(map, height) {
      var scale = 2**(16 - map.getZoom());
      super(map, scale);

      this.map = map;
      this.height = height;
      this.scale = scale;

      this.setScale = this.setScale.bind(this);
      this.map.events.add('boundschange', this.setScale);

      this.imageRadius = 4;

      this.image = new ymaps.Circle(
          [null, this.imageRadius * this.scale], {}, {
            fillColor: '#0000FF',  // Blue color
            strokeColor: '#00FF00',  // Green color
            strokeWidth: 2,
            zIndex: 6
          });

      var MyIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="px-2 py-1 bg-success text-center rounded border d-inline-block"' +
            'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' +
          '$[properties.iconContent]' +
        '</div>');

      this.heightPlacemark.options.set('iconLayout', MyIconLayout);
      //this.heightPlacemark.options.set('zIndex', 7);

      this.prevVertex = null;
      this.nextVertex = null;
      this.edge = null;

      this.eventCircle.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.switchPlacemarkIsVisible();
      }.bind(this));
    }


    setCoordinates(point) {
      super.setCoordinates(point);
      this.image.geometry.setCoordinates(point);
    }

    /**
     * Hiding Vertex.
     */
    hide() {
      super.hide();
      this.image.geometry.setCoordinates(null);
      //this.setCoordinates(null);
      //this.chuteImage.setCoordinates(null);
    }


    addToMap() {
      if (!this.vertexIsOnMap) {
        this.map.geoObjects.add(this.image);
      }
      super.addToMap();
    }

    removeFromMap() {
      if (this.vertexIsOnMap) {
        this.map.geoObjects.remove(this.image);
      }
      super.removeFromMap();
    }

    setScale() {
      var scale = 2**(16 - this.map.getZoom());
      super.setScale(scale);
      this.scale = scale;
      this.image.geometry.setRadius(this.imageRadius * this.scale);
    }


    setColor(color) {
      this.image.options.set('fillColor', color);
    }


    setStrokeColor(color) {
      this.image.options.set('strokeColor', color);
    }


    printPlacemarkAndHint(str) {
      super.printPlacemarkAndHint(str + '&nbsp;м');
    }
  }

  provide(WindVertex);
});