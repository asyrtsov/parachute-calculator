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
  class PathEdge extends Polygon {
    /**
     * @param {number[]} pointA - Yandex.Maps coordinates of first point.
     * @param {number[]} pointB - Yandex.Maps coordinates of second point.
     * @param {number} edgeImageWidthWidth
     * @param {number} edgeWidth      
     * @param {number} zIndex - z-index of edge, z-index of edgeImage
     *    will equals zIndex-1.     
     */
    constructor(
      pointA, 
      pointB,
      path, 
      edgeWidth = 1,       
      edgeImageWidth = 0.1, 
      zIndex = 0
    ) {
            
      // Rectangle vertices will be calculated later
      super([], {}, {
        // edge will be invisible
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0, 
        zIndex: zIndex
      });
                            
      this.image = new Polygon([], {}, {
        fillColor: "#0000FF",
        strokeColor: "#0000FF", 
        zIndex: (zIndex - 1)        
      });
      
      this.pointA = pointA;
      this.pointB = pointB;
      this.path = path;
      this.edgeWidth = edgeWidth; 
      this.edgeImageWidth = edgeImageWidth;
      
      this.setCoordinates(pointA, pointB);

      this.divideEdge = this.divideEdge.bind(this);
      this.events.add('click', this.divideEdge);           
    }
    
    
    /**    
     * Here we calculate projection of point = e.get('coords') to 
     * line segment {this.pointA, this.pointB} and then 
     * send that projection to path.divideEdge.     
     * @param {Event} e
     */
    divideEdge(e) {
      
      e.stopPropagation();          
      var point = e.get('coords');
      
      var pointA = this.pointA, 
          pointB = this.pointB;
              
      var vector1 = VectorMath.subVectors(point, pointA), 
          vector2 = VectorMath.subVectors(pointB, pointA);
      vector2 = VectorMath.normaliseVector(vector2);                
      var c = VectorMath.scalarProduct(vector1, vector2);        
      var vector3 = VectorMath.multVectorConstant(vector2, c);
      
      var point2 = VectorMath.addVectors(pointA, vector3);
                            
      this.path.divideEdge(this, point2);    
    }
        
        
    setCoordinates(pointA, pointB) {
      
      var vertices = 
        this.calculateRectangleVertices(pointA, pointB, this.edgeWidth);

      this.geometry.setCoordinates([vertices]);        
      
      var imageVertices = 
        this.calculateRectangleVertices(pointA, pointB, this.edgeImageWidth);

      this.image.geometry.setCoordinates([imageVertices]); 

      this.pointA = pointA;
      this.pointB = pointB;      
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
      
      var vertices = [];  
      vertices[0] = VectorMath.addVectors(pointA, wg);
      vertices[1] = VectorMath.addVectors(pointB, wg);
      vertices[2] = VectorMath.addVectors(pointB, wwg); 
      vertices[3] = VectorMath.addVectors(pointA, wwg);       
                  
      return(vertices);  
    }      
    
        
  } 
  provide(PathEdge);  
}); 