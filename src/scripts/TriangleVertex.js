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
      super([[point2, point2, point2]]);   
               
      this.geometry.setCoordinates([
        this.calculateVertices(point1, point2)
      ]); 
      
      this.options.set("fillColor", "#0000FF");
      this.options.set("strokeColor", "#0000FF");
      this.options.set("zIndex", zIndex);      
    }

    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.    
     */    
    setCoordinates (point1, point2) {
      this.geometry.setCoordinates([
        this.calculateVertices(point1, point2)
      ]);  
    }
    
    /**
     * @param {number[]} point1 - Yandex.Maps point coordinates.
     * @param {number[]} point2 - Yandex.Maps point coordinates.
     * @return {number[][]} p - Array of vertices of TriangleVertex.      
     */     
    calculateVertices (point1, point2) {
                   
      var latitude = point1[0],
          geodesicArrowVector = VectorMath.subVectors(point2, point1),
          localArrowVector = 
            VectorMath.toLocalVector(geodesicArrowVector, latitude);         

      localArrowVector = VectorMath.normaliseVector(localArrowVector);                
      
      // arrow coordinates in local cartesian coordinate system
      var v = [[-2, 1], [-2, -1], [0, 0]];
      var p = [];                 
      for(var i=0; i<3; i++) {   
        v[i] = VectorMath.rotateVector(v[i], localArrowVector);
        p[i] = VectorMath.addVectors(
          point2, 
          VectorMath.toGeodesicVector(v[i], latitude)
        );
      }
            
      return(p);  
    }        
  }
  
  provide(TriangleVertex);      
});