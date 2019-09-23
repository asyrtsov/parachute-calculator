ymaps.modules.define('PathEdge', [
  'Polygon', 
  'VectorMath'  
],
function(provide, Polygon, VectorMath) {
  /**
   * PathEdge consists of two rectangles: 
   *   visible rectangle and invisible rectangle.
   * Invisible rectangle (shell rectangle) is aimed for  
   * more simple clicking (especially in mobile case). 
   * @extends Polygon
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
      chuteDirection = true    
      //edgeWidth = 1,       
      //edgeImageWidth = 0.1, 
      //zIndex = 0
    ) {
        
      var zIndex = 0;               
      // Rectangle vertices will be calculated later
      super([], {}, {
        // edge will be invisible
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0, 
        zIndex: zIndex
      });

      this.pointA = pointA;
      this.pointB = pointB;
      this.path = path;
      // true - for the same directions of Chute and Edge
      this.chuteDirection = chuteDirection;      
      
      var color = this.getColor();
      
      this.image = new Polygon([], {}, {
        fillColor: color,
        strokeColor: color, 
        zIndex: (zIndex - 1)        
      });
            
      this.edgeWidth = 1; // edgeWidth; 
      this.edgeImageWidth = 0.1; // edgeImageWidth;
      
      this.setCoordinates(pointA, pointB);
      
      this.clickNumber = 0;

      this.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick(e);
      }.bind(this));      
    }
    
    getChuteDirection() {
      return this.chuteDirection;
    }
    
    getColor() {
      var color = this.chuteDirection ? "#0000FF" : "#000050";
      return color;
    }

    /**
     * Process both click and dblclick on this edge.
     * Single clicking is for adding new Vertex. 
     * Double clicking is for changing chute direction 
     * on this edge (skydiver can fly with his face directed 
     * with or against edge).
     */       
    processVertexClick(e) {
      this.clickNumber++;
      if (this.clickNumber == 1) {
        setTimeout(function() {        
          if (this.clickNumber == 1) {  // Single Click (add Vertex)
            this.divideEdge(e);                           
            this.clickNumber = 0;
          } else {   
            if (this.clickNumber == 2) {  // Double Click (change chute direction)
              this.chuteDirection = !this.chuteDirection;        
              let color = this.getColor();              
              this.image.options.set("fillColor", color);
              this.image.options.set("strokeColor", color);                            
              this.clickNumber = 0;
              
              this.path.calculator.calculateHeight();
              this.path.printHeightsAndWindPoints();              
            }             
          }  
        }.bind(this), 200);
      }  
    }    

      
    /**    
     * Here we calculate projection of point = e.get('coords') to 
     * line segment {this.pointA, this.pointB} and then 
     * send that projection to path.divideEdge.     
     * @param {Event} e
     */
    divideEdge(e) {
                
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
                  
      return vertices;  
    }              
  } 
  provide(PathEdge);  
}); 