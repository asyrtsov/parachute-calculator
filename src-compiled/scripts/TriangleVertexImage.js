var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('TriangleVertexImage', ['Polygon', 'VectorMath'], function (provide, Polygon, VectorMath) {

  /**
   * Let point1, point2 - two points with Yandex.maps (geodesic) coordinates.
   * TriangleVertex is Yandex maps triangle,
   * such that vector (point1, point2) and that triangle
   * form arrow (end of path).
   * Size of arrow is about several meters.
   */
  var TriangleVertexImage = function (_Polygon) {
    _inherits(TriangleVertexImage, _Polygon);

    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.
     * @param {number} scale - It defines size of Triangle.
     * @param {number} zIndex - z-index of Polygon.
     */
    function TriangleVertexImage(point1, point2, scale, color, strokeColor, zIndex) {
      _classCallCheck(this, TriangleVertexImage);

      // Three vertices of triangle
      var _this = _possibleConstructorReturn(this, (TriangleVertexImage.__proto__ || Object.getPrototypeOf(TriangleVertexImage)).call(this, [], {}, {
        fillColor: color,
        strokeColor: strokeColor,
        strokeWidth: 2,
        zIndex: zIndex
      }));
      // four square brackets is a must for Polygon constructor,
      // non empty super constructor is a must


      _this.triangleVertices = null;
      // Point on triangle side to which edge will be connected
      _this.edgePoint = null;

      _this.scale = scale;
      _this.point1 = point1;
      _this.point2 = point2;

      _this.setCoordinates(point1, point2);
      return _this;
    }

    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.
     */


    _createClass(TriangleVertexImage, [{
      key: 'setCoordinates',
      value: function setCoordinates(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;

        var p = this.calculateVertices(point1, point2);

        this.triangleVertices = [p[0], p[1], p[2]];
        this.edgePoint = p[3];

        this.geometry.setCoordinates([this.triangleVertices]);
      }
    }, {
      key: 'getEdgePoint',
      value: function getEdgePoint() {
        return this.edgePoint;
      }
    }, {
      key: 'setScale',
      value: function setScale(scale) {
        this.scale = scale;
        this.setCoordinates(this.point1, this.point2);
      }
    }, {
      key: 'getScale',
      value: function getScale() {
        return this.scale;
      }

      /**
       * @param {number[]} point1 - Yandex.Maps point coordinates.
       * @param {number[]} point2 - Yandex.Maps point coordinates.
       * @return {number[][]} points - First three points of this array are
       * the vertices of triangle; last point is a point at the triangle side
       * to which edge will be connected.
       */

    }, {
      key: 'calculateVertices',
      value: function calculateVertices(point1, point2) {

        var latitude = point1[0],
            geodesicArrowVector = VectorMath.subVectors(point2, point1),
            localArrowVector = VectorMath.toLocalVector(geodesicArrowVector, latitude);

        localArrowVector = VectorMath.normaliseVector(localArrowVector);

        // Points coordinates in local cartesian coordinate system.
        // First three point are the vertices of triangle.
        // Last point is a point at the triangle side
        // to which edge will be connected.
        var pointsLocal = [[-2, 0.5], [-2, -0.5], [0, 0], [-2, 0]];
        for (var i = 0; i < 4; i++) {
          for (var j = 0; j < 2; j++) {
            pointsLocal[i][j] *= this.scale;
          }
        }

        var points = [];
        for (var i = 0; i < pointsLocal.length; i++) {
          points[i] = VectorMath.rotateVector(pointsLocal[i], localArrowVector);
          points[i] = VectorMath.addVectors(point2, VectorMath.toGeodesicVector(points[i], latitude));
        }

        return points;
      }
    }]);

    return TriangleVertexImage;
  }(Polygon);

  provide(TriangleVertexImage);
});