ymaps.modules.define('WindVertex', [
  'Circle',
  'Placemark',
  'templateLayoutFactory',
  'ChuteImage',
  'PreVertex',
],
function(provide, Circle, Placemark, templateLayoutFactory,
    ChuteImage, PreVertex) {
  /**
   * Wind Vertex consists of Vertex Image (Circle) and
   * Vertex Placemark for output.
   */
  class WindVertex {
    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {number} radius
     */
    //constructor(wind, map, radius = 4) {
    constructor(height, map) {

      this.height = height;
      this.map = map;

      var color = "#0000FF";
      var strokeColor = "#00FF00";
      var radius = 4;

      var point = null;

      // Coordinates will be set up later (image is not on the map now).
      this.image = new ymaps.Circle([point, radius], {}, {
        fillColor: color,
        strokeColor: strokeColor,
        strokeWidth: 2
      });

      var MyIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="px-2 py-1 bg-success text-center rounded border d-inline-block"' +
              'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' +
          '$[properties.iconContent]' +
        '</div>');

      // Placemark for Height of Chute at this vertex.
      // Coordinates will be set up later.
      this.heightPlacemark = new ymaps.Placemark(point, {}, {
        iconLayout: MyIconLayout,
        iconOffset: [0, -35],
        cursor: 'arrow'
      });

      this.prevVertex = null;
      this.nextVertex = null;

      // Image of chute which shows chute direction on the this.nextEdge
      this.chuteImage = new ChuteImage();

      this.placemarkIsVisible = true;
      //this.printPlacemark(wind.getHeight() + "&nbsp;м");
      this.printPlacemark(height);

      this.clickNumber = 0;
      this.placemarkIsShown = true;

      this.image.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick();
      }.bind(this));

      // remove standart map zoom for double click
      this.image.events.add('dblclick', function(e) {
        e.stopPropagation();
      });

      this.vertexIsOnMap = false;
      this.chuteIsOnMap = false;
      this.edge = null;
    }


    getCoordinates() {
      return this.image.geometry.getCoordinates();
    }


    setCoordinates(point) {
      if (point == null) {
        if (this.vertexIsOnMap) {
          this.removeFromMap();
        }
      } else {
        if (!this.vertexIsOnMap) {
          this.addToMap();
        }
        this.image.geometry.setCoordinates(point);
        this.heightPlacemark.geometry.setCoordinates(point);
      }
    }


    setChuteImageCoordinates(point) {
      this.chuteImage.setCoordinates(point);
      if (point == null) {
        if (this.chuteIsOnMap) {
          this.map.geoObjects.remove(this.chuteImage);
          this.chuteIsOnMap = false;
        }
      } else {
        if (!this.chuteIsOnMap) {
          this.map.geoObjects.add(this.chuteImage);
          this.chuteIsOnMap = true;
        }
      }
    }


    scale(scale) {
      var radius = this.image.geometry.getRadius();
      radius = radius * scale;
      this.image.geometry.setRadius(radius);
    }


    processVertexClick() {
      this.placemarkIsVisible = !this.placemarkIsVisible;
      this.heightPlacemark.options.set('visible', this.placemarkIsVisible);
    }

    /**
     * @param {string | null} str - This will be printed in this.heightPlacemark
     */
    printPlacemark(str) {
      var newStr = (str == null) ? '' : str;
      this.heightPlacemark.properties.set('iconContent', newStr  + "&nbsp;м");
    }

    printHint(str) {
      var newStr = (str == null) ? '' : str;
      this.properties.set('hintContent', newStr  + "&nbsp;м");
    }

    addToMap() {
      if (this.vertexIsOnMap) {
        console.warn('Wind Vertex have already been added.');
        return;
      }
      this.map.geoObjects.add(this.image);
      this.map.geoObjects.add(this.heightPlacemark);
      //this.map.geoObjects.add(this.chuteImage);
      this.vertexIsOnMap = true;
    }

    removeFromMap() {
      if (!this.vertexIsOnMap) {
        console.warn('Wind Vertex have already been removed.');
        return;
      }
      this.map.geoObjects.remove(this.image);
      this.map.geoObjects.remove(this.heightPlacemark);
      //this.map.geoObjects.remove(this.chuteImage);
      /*
      if (this.chuteImageIsOnMap) {
        this.map.geoObjects.remove(this.chuteImage);
        this.chuteImageIsOnMap = false;
      }    */
      this.vertexIsOnMap = false;
      this.removeChuteImageFromMap();
    }


    addChuteImageToMap() {
      if (!this.chuteIsOnMap) {
        this.path.map.geoObjects.add(this.chuteImage);
        this.chuteIsOnMap = true;
      }
    }

    removeChuteImageFromMap() {
      if (this.chuteIsOnMap) {
        this.path.map.geoObjects.remove(this.chuteImage);
        this.chuteIsOnMap = false;
      }
    }

  }
  provide(WindVertex);
});