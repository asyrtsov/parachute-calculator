ymaps.modules.define('TriangleVertex', [
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
  class TriangleVertex extends Polygon {
    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates. 
     * @param {number} zIndex - z-index of Polygon.     
     */
    constructor(point1, point2, zIndex=0) {
      // four square brackets is a must for Polygon constructor, 
      // non empty super constructor is a must     
      super([], {}, {
        fillColor: "#0000FF", 
        strokeColor: "#0000FF", 
        zIndex: zIndex          
      });   
      
      // Three vertices of triangle 
      this.triangleVertices = null;
      // Point on triangle side to which edge will be connected
      this.edgePoint = null;
      
      this.setCoordinates(point1, point2);       
    }

    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.    
     */    
    setCoordinates (point1, point2) {
      var p = this.calculateVertices(point1, point2);

      this.triangleVertices = [p[0], p[1], p[2]];
      this.edgePoint = p[3]; 
      
      this.geometry.setCoordinates([this.triangleVertices]); 
    }
    
    getEdgePoint() {
      return(this.edgePoint);
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
  
  provide(TriangleVertex);      
});