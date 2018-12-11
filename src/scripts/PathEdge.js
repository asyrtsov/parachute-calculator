/** @module PathEdge */
ymaps.modules.define('PathEdge', [
  'Polygon', 
  'VectorMath'  
],
function(provide, Polygon, VectorMath) {
  /**
   * PathEdge consists of two rectangles: 
   *   visible rectangle and invisible rectangle.
   * Invisible rectangle (shell rectangle) is for the means of 
   * more simple clicking (especially in mobile case)
   */
  class PathEdge {
    /**
     * @param {number[]} pointA - Yandex.Maps coordinates of first point.
     * @param {number[]} pointB - Yandex.Maps coordinates of second point.
     * @param {number} imageRectangleWidth
     * @param {number} outerRectangleWidth      
     * @param {number} zIndex - z-index of outerRectangle, z-index of imageRectangle
     *    will equals zIndex-1.     
     */
    constructor(
      pointA, 
      pointB, 
      imageRectangleWidth = 0.1, 
      shellRectangleWidth = 1, 
      zIndex = 0
    ) {
      
      var vertices = 
        this.calculateRectangleVertices(pointA, pointB, imageRectangleWidth);              
     
     console.log(vertices);
          
      this.image = new Polygon([vertices], {}, {
        fillColor: "#0000FF",
        strokeColor: "#0000FF"                             
      });
                
    }
    
    /**
     * @param {number} width - Width of Rectangle, in meters. 
     */    
    calculateRectangleVertices (pointA, pointB, width) {
                  
      var latitude = pointA[0],
          geodesicVectorAB = VectorMath.subVectors(pointB, pointA);

      var cartVectorAB = 
            VectorMath.toLocalVector(geodesicVectorAB, latitude);         

      var v = VectorMath.normaliseVector(cartVectorAB);
      
      var w = [(-v[1])*width , v[0]*width];
      
      
      var wg = VectorMath.toGeodesicVector(w, latitude);
      var wwg = [wg[0]*(-1), wg[1]*(-1)];
      
      var vertex = [];  
      vertex[0] = VectorMath.addVectors(pointA, wg);
      vertex[1] = VectorMath.addVectors(pointB, wg);
      vertex[2] = VectorMath.addVectors(pointB, wwg); 
      vertex[3] = VectorMath.addVectors(pointA, wwg);       
                  
      return(vertex);  
    }      
    
        
  } 
  provide(PathEdge);  
}); 