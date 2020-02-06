ymaps.modules.define('Vertex', [
  'Circle',
  'Rectangle',
  'TriangleVertexImage',
  'templateLayoutFactory',
  'PreVertex',
],
function(provide, Circle, Rectangle, TriangleVertexImage,
    templateLayoutFactory, PreVertex) {
  /**
   * Vertex of Path.
   * Vertex extends PreVertex:
   * we add Vertex Image (Circle or Triangle) and special layouts
   * for Vertex Placemark (with and without closing cross).
   */
  class Vertex extends PreVertex {
    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {AppMap} map
     * @param {Path} path - Link to parent Path; we need it because some vertex
     * operations (like clicking on Placemark Cross = Path clear) change the Path.
     */
    constructor(map, point, path) {
      var scale = 2**(16 - map.getZoom());

      super(map, scale, point);

      this.map = map;
      this.path = path;
      this.scale = scale;

      this.type = 'pathVertex';

      this.setScale = this.setScale.bind(this);
      map.events.add('boundschange', this.setScale);

      this.eventCircle.options.set('draggable', true);
      this.eventCircle.options.set('zIndex', 12);
      //this.heightPlacemark.options.set('zIndex', 1);

      // Image of Vertex. Object of classes: ymaps.Circle or TriangleVertexImage.
      // To set it, use this.setTriangleImage() or this.setCircleImage()
      // You should not add Vertex to Map until Image is not initialized.
      this.image = null;
      this.imageZIndex = 5;
      // null - for undefined (this.image = null),
      // true - for Triangle Image, false - for Circle Image.
      this.imageIsTriangle = null;
      this.circleImageRadius = 4;

      // Blue color
      this.color = '#0000FF';
      this.strokeColor = '#0000FF';

      // References to some another Vertices.
      this.prevVertex = null;
      this.nextVertex = null;

      this.prevEdge = null;
      this.nextEdge = null;

      // true if this Vertex is situated between
      // Base Vertex and Last Vertex of Path.
      // null - for Base Vertex itself.
      this.isBetweenBaseAndLast = null;

      this.clickNumber = 0;

      // Turning on/off vertex when conditon
      // "reachable/unreachable" was changed
      this.wasTurnOffBecauseUnreachable = false;
      // The same for back direction
      this.wasTurnOffBecauseBackUnreachable = false;

      // Chute height at this vertex. It will be calculated later.
      // Use this.setHeight to set up this.height.
      this.height = null;

      this.eventCircle.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick();
      }.bind(this));


      this.eventCircle.events.add('contextmenu', function(e) {
        e.stopPropagation();
        if (this.path.baseVertex != this && this.height != null && this.height >= 0) {
          this.path.setBaseVertex(this);
        } else if (this.height < 0) {
          alert('Нельзя вершину с отрицательной высотой делать базовой!');
        } else if (this.height == null) {
          alert('Нельзя вершину с неопределенной высотой делать базовой!');
        }
      }.bind(this));


      this.eventCircle.events.add('drag', function(e) {
        e.stopPropagation();
        var point = this.eventCircle.geometry.getCoordinates();
        this.setCoordinates(point);
        this.path.dragVertex(this);
      }.bind(this));

    }


    /**
     * Set the same coordinates for Event Circle,
     * Vertex Placemark, Vertex Image.
     * Change Direction of Triangle for this Vertex
     * (if this Vertex is Triangle Vertex)
     */
    setCoordinates(point) {
      super.setCoordinates(point);

      // Note: it supposed that in case of Triangle Vertex, prevVertex != null.
      if (this.image != null) {
        if (this.imageIsTriangle) {
          var prevPoint = this.prevVertex.getCoordinates();
          // Here we calculate vertices of Image Triangle
          this.image.setCoordinates(prevPoint, point);
        } else {
          // In this case, this.image is a Circle, so
          // we can set coordinates of it center.
          this.image.geometry.setCoordinates(point);
        }
      }

      if (this.nextVertex != null && this.nextVertex.imageIsTriangle) {
        var nextPoint = this.nextVertex.getCoordinates();
        this.nextVertex.image.setCoordinates(point, nextPoint);
      }
    }


    setScale() {
      var scale = 2**(16 - this.map.getZoom());
      super.setScale(scale);
      this.scale = scale;

      if (this.imageIsTriangle) {
        this.image.setScale(scale);
      } else {
        this.image.geometry.setRadius(this.circleImageRadius * scale);
      }
    }

    setIsBetweenBaseAndLast(isBetweenBaseAndLast) {
      this.isBetweenBaseAndLast = isBetweenBaseAndLast;
    }


    /**
     * @param {Vertex | null} vertex
     */
    setNextVertex(vertex) {
      this.nextVertex = vertex;
      if (vertex != null) {
        vertex.prevVertex = this;
      }
    }

    setPrevVertex(vertex) {
      this.prevVertex = vertex;
      if (vertex != null) {
        vertex.nextVertex = this;
      }
    }


    setNextEdge(edge) {
      this.nextEdge = edge;
      if (edge != null) {
        edge.prevVertex = this;
        edge.nextVertex = this.nextVertex;
        if (this.nextVertex != null) {
          this.nextVertex.prevEdge = edge;
        }
      }
    }

    setPrevEdge(edge) {
      this.prevEdge = edge;
      if (edge != null) {
        edge.nextVertex = this;
        edge.prevVertex = this.prevVertex;
        if (this.prevVertex != null) {
          this.prevVertex.nextEdge = edge;
        }
      }
    }


    /**
     * @param {number[]} prevPoint - Previuos point that define direction of Triangle.
     */
    setTriangleImage(prevPoint) {
      this.imageIsTriangle = true;
      var map = this.map;

      if (this.vertexIsOnMap) {
        map.geoObjects.remove(this.image);
        map.geoObjects.remove(this.heightPlacemark);
      }

      var point1 = prevPoint;
      var point2 = this.getCoordinates();

      // Set Triangle Image
      this.image =
          new TriangleVertexImage(point1, point2, this.scale,
              this.color, this.strokeColor, this.imageZIndex);

      // Set Placemark with Closing Cross
      var path = this.path;
      var MyIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="px-2 py-1 bg-info d-inline-flex rounded border align-items-center"' +
              'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' +
          '<div class="bg-info pr-2">$[properties.iconContent]</div>' +
          '<div class="bg-info placemarkCross placemarkCrossImage"></div>' +
          //'<div class="p-0 bg-info hoverColor">&#10006;</div>' +
        '</div>', {
          build: function () {
            this.constructor.superclass.build.call(this);
            this.path = path;
            var elem = this.getData().geoObject;
            elem.events.add('click', this.clickFunc, this);
            elem.events.add('mouseenter', this.mouseEnter, this);
            elem.events.add('mouseleave', this.mouseLeave, this);
          },

          clear: function () {
            var elem = this.getData().geoObject;
            elem.events.remove('click', this.clickFunc, this);
            elem.events.remove('mouseenter', this.mouseEnter, this);
            elem.events.remove('mouseleave', this.mouseLeave, this);

            this.constructor.superclass.clear.call(this);
          },

          getShape: function () {
            var parentElement = this.getParentElement();
            if (parentElement != null) {
              var element = $('.d-inline-flex', parentElement);
              var width = element[0].offsetWidth;
              var height = element[0].offsetHeight;
              var position = element.position();

              return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                [position.left + width - 15, position.top],
                [position.left + width, position.top + height]
              ]));
            } else {
              return null;
            }
          },

          clickFunc: function(e) {
            e.preventDefault();
            if (this.path.length > 2) {
              if (confirm("Удалить все метки? \n\n (для удаления только одной метки дважды щелкните по ней)")) {
                this.path.clear();
              };
            } else {
              this.path.clear();
            }
          }.bind(this),

          mouseEnter: function() {
            var elem = this.getParentElement().getElementsByClassName('placemarkCross')[0];
            $(elem).removeClass('placemarkCrossImage');
            $(elem).addClass('placemarkCrossImagePointed');

          },

          mouseLeave: function() {
            var elem = this.getParentElement().getElementsByClassName('placemarkCross')[0];
            $(elem).removeClass('placemarkCrossImagePointed');
            $(elem).addClass('placemarkCrossImage');
          }
        }
      );

      var MyIconShape = {
        type: 'Rectangle',
        coordinates: [[71, 0], [96, 25]]
      };

      this.heightPlacemark.options.set('iconLayout', MyIconLayout);
      this.heightPlacemark.options.set('iconShape', MyIconShape);

      if (this.vertexIsOnMap) {
        map.geoObjects.add(this.image);
        map.geoObjects.add(this.heightPlacemark);
      }
    }


    setCircleImage() {
      this.imageIsTriangle = false;
      var map = this.map;

      if (this.vertexIsOnMap) {
        map.geoObjects.remove(this.image);
        map.geoObjects.remove(this.heightPlacemark);
      }

      var point = this.getCoordinates();
      this.image = new ymaps.Circle(
          [point, this.circleImageRadius * this.scale], {}, {
            fillColor: this.color,
            strokeColor: this.strokeColor,
            strokeWidth: 2,
            zIndex: this.imageZIndex
          });

      // Set Placemark without Closing Cross
      var MyIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="px-2 py-1 bg-info text-center rounded border d-inline-block"' +
              'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' +
          '$[properties.iconContent]' +
        '</div>'
      );

      this.heightPlacemark.options.set('iconLayout', MyIconLayout);
      this.heightPlacemark.options.set('iconShape', null);

      if (this.vertexIsOnMap) {
        map.geoObjects.add(this.image);
        map.geoObjects.add(this.heightPlacemark);
      }
    }


    addToMap() {
      if (this.image != null) {
        if (!this.vertexIsOnMap) {
          this.map.geoObjects.add(this.image);
        }
        super.addToMap();
      } else {
        console.warn('The image was not initialized yet!');
      }
    }


    removeFromMap() {
      if (this.vertexIsOnMap) {
        this.map.geoObjects.remove(this.image);
      }
      super.removeFromMap();
    }


    /**
     * Process both click and dblclick on this vertex.
     * Single clicking is for showing/hiding Placemark.
     * Double clicking is for vertex removing.
     */
    processVertexClick() {
      this.clickNumber++;
      if (this.clickNumber == 1) {
        setTimeout(function() {
          if (this.clickNumber == 1) {  // Single Click (show/hide Placemark)
            if (this.nextVertex != null) {
              this.switchPlacemarkIsVisible();
            }
            this.clickNumber = 0;
          } else {  // Double Click (remove Vertex)
            this.path.removeVertex(this);
            this.clickNumber = 0;
          }
        }.bind(this), 200);
      }
    }

    setColor(color) {
      this.color = color;
      if (this.image != null) {
        this.image.options.set('fillColor', color);
      } else {
        console.warn('The image was not initialized yet!');
      }
    }


    setStrokeColor(color) {
      this.strokeColor = color;
      if (this.image != null) {
        this.image.options.set('strokeColor', color);
      } else {
        console.warn('The image was not initialized yet!');
      }
    }


    setHeight(height) {
      this.height = height;

      if (typeof(height) == 'number') {
        this.printPlacemarkAndHint(Math.floor(height) + '&nbsp;м');

        // Blue color.
        this.setColor('#0000FF');
        if (this.path.baseVertex == this) {
          // Yellow color.
          this.setStrokeColor('#FFFF00');
        } else {
          this.setStrokeColor('#0000FF');
        }
      } else {
        this.printPlacemarkAndHint('&#x26D4;');
        // Red color.
        this.setColor('#FF0000');
        this.setStrokeColor('#FF0000');
      }
    }
  }

  provide(Vertex);
});