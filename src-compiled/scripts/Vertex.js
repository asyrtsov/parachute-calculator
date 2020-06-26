var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('Vertex', ['Circle', 'Rectangle', 'TriangleVertexImage', 'templateLayoutFactory', 'PreVertex'], function (provide, Circle, Rectangle, TriangleVertexImage, templateLayoutFactory, PreVertex) {
  /**
   * Vertex of Path.
   * Vertex extends PreVertex:
   * we add Vertex Image (Circle or Triangle) and special layouts
   * for Vertex Placemark (with and without closing cross).
   */
  var Vertex = function (_PreVertex) {
    _inherits(Vertex, _PreVertex);

    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {AppMap} map
     * @param {Path} path - Link to parent Path; we need it because some vertex
     * operations (like clicking on Placemark Cross = Path clear) change the Path.
     */
    function Vertex(map, point, path) {
      _classCallCheck(this, Vertex);

      var scale = Math.pow(2, 16 - map.getZoom());

      var _this = _possibleConstructorReturn(this, (Vertex.__proto__ || Object.getPrototypeOf(Vertex)).call(this, map, scale, point));

      _this.map = map;
      _this.path = path;
      _this.scale = scale;

      _this.type = 'pathVertex';

      _this.setScale = _this.setScale.bind(_this);
      map.events.add('boundschange', _this.setScale);

      _this.eventCircle.options.set('draggable', true);
      _this.eventCircle.options.set('zIndex', 120);
      //console.log(this.eventCircle.options);
      //this.heightPlacemark.options.set('zIndex', 1);

      // Image of Vertex. Object of classes: ymaps.Circle or TriangleVertexImage.
      // To set it, use this.setTriangleImage() or this.setCircleImage()
      // You should not add Vertex to Map until Image is not initialized.
      _this.image = null;
      _this.imageZIndex = 5;
      // null - for undefined (this.image = null),
      // true - for Triangle Image, false - for Circle Image.
      // You should use this.imageIsTriangle only if this.image != null.
      _this.imageIsTriangle = null;
      _this.circleImageRadius = 4;

      // Blue color
      _this.color = '#0000FF';
      _this.strokeColor = '#0000FF';

      _this.heightPlacemarkColor = 'bg-info';

      // References to previous and next Vertices.
      _this.prevVertex = null;
      _this.nextVertex = null;

      _this.prevEdge = null;
      _this.nextEdge = null;

      _this.nextWind = null;

      // true if this Vertex is situated between
      // Base Vertex and Last Vertex of Path.
      // null - for Base Vertex itself.
      _this.isBetweenBaseAndLast = null;

      _this.clickNumber = 0;

      // Turning on/off vertex when conditon
      // "reachable/unreachable" was changed
      _this.wasTurnOffBecauseUnreachable = false;
      // The same for back direction
      _this.wasTurnOffBecauseBackUnreachable = false;

      // Chute height at this vertex. It will be calculated later.
      // Use this.setHeight to set up this.height.
      _this.height = null;

      _this.eventCircle.events.add('click', function (e) {
        e.stopPropagation(); // remove standart zoom for click
        this.processVertexClick();
      }.bind(_this));

      _this.eventCircle.events.add('contextmenu', function (e) {
        e.stopPropagation();
        if (this.nextVertex != null) {
          this.switchPlacemarkIsVisible();
        }

        /*
        if (this.path.baseVertex != this && this.height != null && this.height >= 0) {
          this.path.setBaseVertex(this);
        } else if (this.height < 0) {
          alert('Нельзя вершину с отрицательной высотой делать базовой!');
        } else if (this.height == null) {
          alert('Нельзя вершину с неопределенной высотой делать базовой!');
        }  */
      }.bind(_this));

      _this.eventCircle.events.add('drag', function (e) {
        e.stopPropagation();
        var point = this.eventCircle.geometry.getCoordinates();
        this.setCoordinates(point);
        this.path.dragVertex(this);
      }.bind(_this));

      return _this;
    }

    /**
     * Set the same coordinates for Event Circle,
     * Vertex Placemark, Vertex Image.
     * Change Direction of Triangle for this Vertex
     * (if this Vertex is Triangle Vertex)
     */


    _createClass(Vertex, [{
      key: 'setCoordinates',
      value: function setCoordinates(point) {
        _get(Vertex.prototype.__proto__ || Object.getPrototypeOf(Vertex.prototype), 'setCoordinates', this).call(this, point);

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
    }, {
      key: 'setScale',
      value: function setScale() {
        var scale = Math.pow(2, 16 - this.map.getZoom());
        _get(Vertex.prototype.__proto__ || Object.getPrototypeOf(Vertex.prototype), 'setScale', this).call(this, scale);
        this.scale = scale;

        if (this.image != null) {
          if (this.imageIsTriangle) {
            this.image.setScale(scale);
          } else {
            this.image.geometry.setRadius(this.circleImageRadius * scale);
          }
        }
      }
    }, {
      key: 'setIsBetweenBaseAndLast',
      value: function setIsBetweenBaseAndLast(isBetweenBaseAndLast) {
        this.isBetweenBaseAndLast = isBetweenBaseAndLast;
      }

      /**
       * @param {Vertex | null} vertex
       */

    }, {
      key: 'setNextVertex',
      value: function setNextVertex(vertex) {
        this.nextVertex = vertex;
        if (vertex != null) {
          vertex.prevVertex = this;
        }
      }
    }, {
      key: 'setPrevVertex',
      value: function setPrevVertex(vertex) {
        this.prevVertex = vertex;
        if (vertex != null) {
          vertex.nextVertex = this;
        }
      }
    }, {
      key: 'setNextEdge',
      value: function setNextEdge(edge) {
        this.nextEdge = edge;
        if (edge != null) {
          edge.prevVertex = this;
          edge.nextVertex = this.nextVertex;
          if (this.nextVertex != null) {
            this.nextVertex.prevEdge = edge;
          }
        }
      }
    }, {
      key: 'setPrevEdge',
      value: function setPrevEdge(edge) {
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

    }, {
      key: 'setTriangleImage',
      value: function setTriangleImage(prevPoint) {
        this.imageIsTriangle = true;
        var map = this.map;

        if (this.vertexIsOnMap) {
          map.geoObjects.remove(this.image);
          map.geoObjects.remove(this.heightPlacemark);
        }

        var point1 = prevPoint;
        var point2 = this.getCoordinates();

        // Set Triangle Image
        this.image = new TriangleVertexImage(point1, point2, this.scale, this.color, this.strokeColor, this.imageZIndex);

        // Set Placemark with Closing Cross
        var path = this.path;
        var MyIconLayout = ymaps.templateLayoutFactory.createClass('<div class="px-2 py-1 ' + this.heightPlacemarkColor + ' d-inline-flex rounded border align-items-center"' + 'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' + '<div class="' + this.heightPlacemarkColor + ' pr-2">$[properties.iconContent]</div>' + '<div class="' + this.heightPlacemarkColor + ' placemarkCross placemarkCrossImage"></div>' +
        //'<div class="p-0 bg-info hoverColor">&#10006;</div>' +
        '</div>', {
          build: function build() {
            this.constructor.superclass.build.call(this);
            this.path = path;
            var elem = this.getData().geoObject;
            elem.events.add('click', this.clickFunc, this);
            elem.events.add('mouseenter', this.mouseEnter, this);
            elem.events.add('mouseleave', this.mouseLeave, this);
          },

          clear: function clear() {
            var elem = this.getData().geoObject;
            elem.events.remove('click', this.clickFunc, this);
            elem.events.remove('mouseenter', this.mouseEnter, this);
            elem.events.remove('mouseleave', this.mouseLeave, this);

            this.constructor.superclass.clear.call(this);
          },

          getShape: function getShape() {
            var parentElement = this.getParentElement();
            if (parentElement != null) {
              var element = $('.d-inline-flex', parentElement);
              var width = element[0].offsetWidth;
              var height = element[0].offsetHeight;
              var position = element.position();

              return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([[position.left + width - 15, position.top], [position.left + width, position.top + height]]));
            } else {
              return null;
            }
          },

          clickFunc: function (e) {
            e.preventDefault();
            if (this.path.length > 2) {
              if (confirm("Удалить путь? \n\n (для удаления только одной вершины дважды щелкните по ней)")) {
                this.path.clear();
              };
            } else {
              this.path.clear();
            }
          }.bind(this),

          mouseEnter: function mouseEnter() {
            var elem = this.getParentElement().getElementsByClassName('placemarkCross')[0];
            $(elem).removeClass('placemarkCrossImage');
            $(elem).addClass('placemarkCrossImagePointed');
          },

          mouseLeave: function mouseLeave() {
            var elem = this.getParentElement().getElementsByClassName('placemarkCross')[0];
            $(elem).removeClass('placemarkCrossImagePointed');
            $(elem).addClass('placemarkCrossImage');
          }
        });

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
    }, {
      key: 'setCircleImage',
      value: function setCircleImage() {
        this.imageIsTriangle = false;
        var map = this.map;

        if (this.vertexIsOnMap) {
          map.geoObjects.remove(this.image);
          map.geoObjects.remove(this.heightPlacemark);
        }

        var point = this.getCoordinates();
        this.image = new ymaps.Circle([point, this.circleImageRadius * this.scale], {}, {
          fillColor: this.color,
          strokeColor: this.strokeColor,
          strokeWidth: 2,
          zIndex: this.imageZIndex
        });

        // Set Placemark without Closing Cross
        var MyIconLayout = ymaps.templateLayoutFactory.createClass('<div class="px-2 py-1 ' + this.heightPlacemarkColor + ' text-center rounded border d-inline-block"' + 'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' + '$[properties.iconContent]' + '</div>');

        this.heightPlacemark.options.set('iconLayout', MyIconLayout);
        this.heightPlacemark.options.set('iconShape', null);

        if (this.vertexIsOnMap) {
          map.geoObjects.add(this.image);
          map.geoObjects.add(this.heightPlacemark);
        }
      }
    }, {
      key: 'addToMap',
      value: function addToMap() {
        if (this.image != null) {
          if (!this.vertexIsOnMap) {
            this.map.geoObjects.add(this.image);
          }
          _get(Vertex.prototype.__proto__ || Object.getPrototypeOf(Vertex.prototype), 'addToMap', this).call(this);
        } else {
          console.warn('The image was not initialized yet!');
        }
      }
    }, {
      key: 'removeFromMap',
      value: function removeFromMap() {
        if (this.vertexIsOnMap) {
          this.map.geoObjects.remove(this.image);
        }
        _get(Vertex.prototype.__proto__ || Object.getPrototypeOf(Vertex.prototype), 'removeFromMap', this).call(this);
      }

      /**
       * Process both click and dblclick on this vertex.
       * Single clicking is for showing/hiding Placemark.
       * Double clicking is for vertex removing.
       */

    }, {
      key: 'processVertexClick',
      value: function processVertexClick() {
        this.clickNumber++;
        if (this.clickNumber == 1) {
          setTimeout(function () {
            if (this.clickNumber == 1) {
              // Single Click (show/hide Placemark)
              //if (this.nextVertex != null) {
              //  this.switchPlacemarkIsVisible();
              //}

              if (this.path.baseVertex != this && this.height != null && this.height >= 0) {
                this.path.setBaseVertex(this);
              } else if (this.height < 0) {
                alert('Нельзя вершину с отрицательной высотой делать базовой!');
              } else if (this.height == null) {
                alert('Нельзя вершину с неопределенной высотой делать базовой!');
              }
              this.clickNumber = 0;
            } else {
              // Double Click (remove Vertex)
              this.path.removeVertex(this);
              this.clickNumber = 0;
            }
          }.bind(this), 200);
        }
      }

      /**
       *
       * @param {String} color - RGB.
       * Note: You should reRenderImageColors() or reRender() Vertex
       * or setTriangleImage() or setCircleImage()
       * after changing heightPlacemarkColor.
       */

    }, {
      key: 'setColor',
      value: function setColor(color) {
        this.color = color;
        /*
        if (this.image != null) {
          this.image.options.set('fillColor', color);
        } else {
          console.warn('The image was not initialized yet!');
        } */
      }

      /**
       *
       * @param {String} color - RGB.
       */

    }, {
      key: 'setStrokeColor',
      value: function setStrokeColor(color) {
        this.strokeColor = color;
        /*
        if (this.image != null) {
          this.image.options.set('strokeColor', color);
        } else {
          console.warn('The image was not initialized yet!');
        }  */
      }
    }, {
      key: 'reRenderImageColors',
      value: function reRenderImageColors() {
        if (this.image != null) {
          this.image.options.set('fillColor', this.color);
          this.image.options.set('strokeColor', this.strokeColor);
        } else {
          console.warn('The image was not initialized yet!');
        }
      }

      /**
       * @param {String} color - Boostrap color class:
       * bg-info, bg-warning, ...
       * Note: You should reRender() Vertex or setTriangleImage() or
       * setCircleImage() after changing heightPlacemarkColor.
       */

    }, {
      key: 'setHeightPlacemarkColor',
      value: function setHeightPlacemarkColor(color) {
        this.heightPlacemarkColor = color;
      }
    }, {
      key: 'reRender',
      value: function reRender() {
        if (this.image != null) {
          if (this.imageIsTriangle) {
            this.setTriangleImage(this.prevVertex.getCoordinates());
          } else {
            this.setCircleImage();
          }
        } else {
          console.warn('The image was not initialized yet!');
        }
      }
    }, {
      key: 'setHeight',
      value: function setHeight(height) {
        this.height = height;

        if (typeof height == 'number') {
          this.printPlacemarkAndHint(Math.floor(height) + '&nbsp;м');

          // Blue color.
          this.setColor('#0000FF');
          if (this.path.baseVertex == this) {
            // Yellow color.
            this.setStrokeColor('#FFC107');
          } else {
            this.setStrokeColor('#0000FF');
          }
        } else {
          this.printPlacemarkAndHint('&#x26D4;');
          // Red color.
          this.setColor('#FF0000');
          this.setStrokeColor('#FF0000');
        }
        this.reRenderImageColors();
      }
    }]);

    return Vertex;
  }(PreVertex);

  provide(Vertex);
});