ymaps.modules.define('TriangleVertexImage', [
  'Polygon',
  'VectorMath'
],
function(provide, Polygon, VectorMath) {

  /**
   * Let point1, point2 - two points with Yandex.maps (geodesic) coordinates.
   * TriangleVertex is Yandex maps triangle,
   * such that vector (point1, point2) and that triangle
   * form arrow (end of path).
   * Size of arrow is about several meters.
   */
  class TriangleVertexImage extends Polygon {
    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.
     * @param {number} scale - It defines size of Triangle.
     * @param {number} zIndex - z-index of Polygon.
     */
    constructor(point1, point2, scale, color, strokeColor, zIndex) {
      // four square brackets is a must for Polygon constructor,
      // non empty super constructor is a must
      super([], {}, {
        fillColor: color,
        strokeColor: strokeColor,
        strokeWidth: 2,
        zIndex: zIndex
      });

      // Three vertices of triangle
      this.triangleVertices = null;
      // Point on triangle side to which edge will be connected
      this.edgePoint = null;

      this.scale = scale;
      this.point1 = point1;
      this.point2 = point2;

      this.setCoordinates(point1, point2);
    }

    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.
     */
    setCoordinates (point1, point2) {
      this.point1 = point1;
      this.point2 = point2;

      var p = this.calculateVertices(point1, point2);

      this.triangleVertices = [p[0], p[1], p[2]];
      this.edgePoint = p[3];

      this.geometry.setCoordinates([this.triangleVertices]);
    }

    getEdgePoint() {
      return(this.edgePoint);
    }


    setScale(scale) {
      this.scale = scale;
      this.setCoordinates(this.point1, this.point2);
    }


    getScale() {
      return this.scale;
    }


    /**
     * @param {number[]} point1 - Yandex.Maps point coordinates.
     * @param {number[]} point2 - Yandex.Maps point coordinates.
     * @return {number[][]} points - First three points of this array are
     * the vertices of triangle; last point is a point at the triangle side
     * to which edge will be connected.
     */
    calculateVertices (point1, point2) {

      var latitude = point1[0],
          geodesicArrowVector = VectorMath.subVectors(point2, point1),
          localArrowVector =
            VectorMath.toLocalVector(geodesicArrowVector, latitude);

      localArrowVector = VectorMath.normaliseVector(localArrowVector);

      // Points coordinates in local cartesian coordinate system.
      // First three point are the vertices of triangle.
      // Last point is a point at the triangle side
      // to which edge will be connected.
      var pointsLocal = [[-2, 0.5], [-2, -0.5], [0, 0], [-2,0]];
      for(var i=0; i<4; i++) {
        for(var j=0; j<2; j++) {
          pointsLocal[i][j] *= this.scale;
        }
      }

      var points = [];
      for(var i=0; i<pointsLocal.length; i++) {
        points[i] = VectorMath.rotateVector(pointsLocal[i], localArrowVector);
        points[i] = VectorMath.addVectors(
          point2,
          VectorMath.toGeodesicVector(points[i], latitude)
        );
      }

      return(points);
    }
  }

  provide(TriangleVertexImage);
});