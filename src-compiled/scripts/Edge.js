var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ymaps.modules.define('Edge', ['Polygon', 'VectorMath'], function (provide, Polygon, VectorMath) {
  /**
   * PathEdge consists of two Rectangles:
   * Image Rectangle and Invisible Event Rectangle.
   * Invisible Event Rectangle is aimed for catching events
   * (we use it to make GUI more friendly for Users in mobile case).
   * Image Rectange consists of Blue Rectangle and Red Rectangle.
   */
  var Edge = function () {
    /**
     * @param {Vertex} prevVertex
     * @param {Vertex} nextVertex
     * @param {Path} edgeImageWidthWidth
     */
    //constructor(prevVertex, nextVertex, path, chuteDirection = true) {
    function Edge(prevVertex, nextVertex, path) {
      _classCallCheck(this, Edge);

      this.prevVertex = prevVertex;
      this.nextVertex = nextVertex;
      this.path = path;
      this.map = path.map;
      // true - if Chute motion and Edge has the same direction
      //this.chuteDirection = chuteDirection;

      this.edgeWidth = 1;
      this.edgeImageWidth = this.edgeWidth / 10; // edgeImageWidth;

      this.scale = Math.pow(2, 16 - this.map.getZoom());
      this.setScale = this.setScale.bind(this);
      this.map.events.add('boundschange', this.setScale);

      // Edge connects prevVertex, nextVertex, itself.
      prevVertex.nextVertex = nextVertex;
      prevVertex.nextEdge = this;
      nextVertex.prevVertex = prevVertex;
      nextVertex.prevEdge = this;

      var zIndex = 0;

      // Rectangle vertices will be calculated later
      this.eventRectangle = new Polygon([], {}, {
        fillOpacity: 0,
        strokeOpacity: 0,
        strokeWidth: 0,
        zIndex: 9
      });

      this.firstImage = new Polygon([], {}, { zIndex: 4 });
      this.secondImage = new Polygon([], {}, { zIndex: 4 });

      this.dividingPoint = null;
      this.calculateEdgeRectangles();
      this.setColor('#0000FF'); // firstImage has blue color.

      this.clickNumber = 0;

      this.edgeIsOnMap = false;

      //this.processVertexClick = this.processVertexClick.bind(this);

      this.eventRectangle.events.add('click', function (e) {
        e.stopPropagation(); // remove standart zoom for click
        this.processVertexClick(e);
      }.bind(this));
    }

    _createClass(Edge, [{
      key: 'setScale',
      value: function setScale() {
        this.scale = Math.pow(2, 16 - this.map.getZoom());
        this.calculateEdgeRectangles();
      }
    }, {
      key: 'setDividingPoint',
      value: function setDividingPoint(point) {
        this.dividingPoint = point;
        this.calculateEdgeRectangles();
      }
    }, {
      key: 'hideDividingPoint',
      value: function hideDividingPoint() {
        this.setDividingPoint(null);
      }
    }, {
      key: 'setColor',
      value: function setColor(firstColor) {
        var secondColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        this.firstImage.options.set('strokeColor', firstColor);
        this.firstImage.options.set('fillColor', firstColor);

        if (secondColor != null) {
          this.secondImage.options.set('strokeColor', secondColor);
          this.secondImage.options.set('fillColor', secondColor);
        }
      }
    }, {
      key: 'addToMap',
      value: function addToMap() {
        if (!this.edgeIsOnMap) {
          this.map.geoObjects.add(this.eventRectangle);
          this.map.geoObjects.add(this.firstImage);
          this.map.geoObjects.add(this.secondImage);
          this.edgeIsOnMap = true;
        }
      }
    }, {
      key: 'removeFromMap',
      value: function removeFromMap() {
        if (this.edgeIsOnMap) {
          this.map.geoObjects.remove(this.eventRectangle);
          this.map.geoObjects.remove(this.firstImage);
          this.map.geoObjects.remove(this.secondImage);
          this.edgeIsOnMap = false;
        }
      }

      /*
      getChuteDirection() {
        return this.chuteDirection;
      }
        getColor() {
        var color = this.chuteDirection ? "#0000FF" : "#000050";
        return color;
      }  */

      /**
       * Process both click and dblclick on this edge.
       * Single clicking is for adding new Vertex.
       * Double clicking is for changing chute direction
       * on this edge (skydiver can fly with his face directed
       * with or against edge).
       */

    }, {
      key: 'processVertexClick',
      value: function processVertexClick(e) {
        this.clickNumber++;
        if (this.clickNumber == 1) {
          setTimeout(function () {
            if (this.clickNumber == 1) {
              // Single Click (add Vertex)
              this.divideEdge(e);
              this.clickNumber = 0;
            } else {
              if (this.clickNumber == 2) {// Double Click (change chute direction)
                /*
                this.chuteDirection = !this.chuteDirection;
                let color = this.getColor();
                this.image.options.set("fillColor", color);
                this.image.options.set("strokeColor", color);
                this.clickNumber = 0;
                  this.path.calculator.calculateHeight();
                this.path.printHeightsAndWindPoints();  */
              }
            }
          }.bind(this), 200);
        }
      }

      /**
       * Here we calculate projection of point = e.get('coords') to
       * line segment {this.pointA, this.pointB} and then
       * send that projection to path.divideEdge.
       * After this operation this Edge will be deleted.
       * @param {Event} e
       */

    }, {
      key: 'divideEdge',
      value: function divideEdge(e) {
        var point = e.get('coords');

        var pointA = this.prevVertex.getCoordinates(),
            pointB = this.nextVertex.getCoordinates();

        var vector1 = VectorMath.subVectors(point, pointA),
            vector2 = VectorMath.subVectors(pointB, pointA);
        vector2 = VectorMath.normaliseVector(vector2);
        var c = VectorMath.scalarProduct(vector1, vector2);
        var vector3 = VectorMath.multVectorConstant(vector2, c);

        var point2 = VectorMath.addVectors(pointA, vector3);

        this.path.divideEdge(this, point2);
      }

      /**
       * Run this function when geometric parameters of
       * prevVertex or nextVertex are changed.
       * It will recalculate Edge parameters.
       */

    }, {
      key: 'calculateEdgeRectangles',
      value: function calculateEdgeRectangles() {
        var pointA = this.prevVertex.getCoordinates();
        var pointB = this.nextVertex.imageIsTriangle ? this.nextVertex.image.getEdgePoint() : this.nextVertex.getCoordinates();

        var vertices = this.calculateRectangleVertices(pointA, pointB, this.edgeWidth * this.scale);
        this.eventRectangle.geometry.setCoordinates([vertices]);

        if (this.dividingPoint == null) {
          vertices = this.calculateRectangleVertices(pointA, pointB, this.edgeImageWidth * this.scale);
          this.firstImage.geometry.setCoordinates([vertices]);
          this.secondImage.geometry.setCoordinates([]);
        } else {
          vertices = this.calculateRectangleVertices(pointA, this.dividingPoint, this.edgeImageWidth * this.scale);
          this.firstImage.geometry.setCoordinates([vertices]);

          vertices = this.calculateRectangleVertices(this.dividingPoint, pointB, this.edgeImageWidth * this.scale);
          this.secondImage.geometry.setCoordinates([vertices]);
        }
      }

      /**
       * @param {number} width - Width of Rectangle, in meters.
       */

    }, {
      key: 'calculateRectangleVertices',
      value: function calculateRectangleVertices(pointA, pointB, width) {

        var latitude = pointA[0],
            geodesicVectorAB = VectorMath.subVectors(pointB, pointA);

        var cartVectorAB = VectorMath.toLocalVector(geodesicVectorAB, latitude);

        var v = VectorMath.normaliseVector(cartVectorAB);

        var w = [-v[1] * width, v[0] * width];

        var wg = VectorMath.toGeodesicVector(w, latitude);
        var wwg = [wg[0] * -1, wg[1] * -1];

        var vertices = [];
        vertices[0] = VectorMath.addVectors(pointA, wg);
        vertices[1] = VectorMath.addVectors(pointB, wg);
        vertices[2] = VectorMath.addVectors(pointB, wwg);
        vertices[3] = VectorMath.addVectors(pointA, wwg);

        return vertices;
      }
    }]);

    return Edge;
  }();

  provide(Edge);
});