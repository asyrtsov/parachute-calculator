ymaps.modules.define('Edge', [
  'Polygon', 
  'VectorMath'  
],
function(provide, Polygon, VectorMath) {
  /**
   * PathEdge consists of two Rectangles: 
   * Image Rectangle and Invisible Event Rectangle.
   * Invisible Event Rectangle is aimed for catching events 
   * (we use it to make GUI more friendly for Users in mobile case). 
   */
  class Edge {    
    /**
     * @param {Vertex} prevVertex
     * @param {Vertex} nextVertex
     * @param {Path} edgeImageWidthWidth
     * @param {boolean} chuteDirection      
     */
    constructor(
      prevVertex, 
      nextVertex,
      path, 
      chuteDirection = true
    ) {

      this.prevVertex = prevVertex;
      this.nextVertex = nextVertex;
      this.path = path; 
      // true - if Chute motion and Edge has the same direction
      this.chuteDirection = chuteDirection;

      this.edgeWidth = path.edgeEventRectangleWidth; // edgeWidth; 
      this.edgeImageWidth = this.edgeWidth / 10; // edgeImageWidth;

      // Edge connects prevVertex, nextVertex, itself.
      prevVertex.nextVertex = nextVertex;
      prevVertex.nextEdge = this;
      nextVertex.prevVertex  = prevVertex;
      nextVertex.prevEdge = this;
      
      var zIndex = 0;

      // Rectangle vertices will be calculated later
      this.eventRectangle = new Polygon([], {}, {
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0, 
        zIndex: zIndex
      });

      var color = this.getColor();
      
      this.image = new Polygon([], {}, {
        fillColor: color,
        strokeColor: color, 
        zIndex: (zIndex - 1)        
      });
            
      this.calculateEdgeRectangles();
      
      this.clickNumber = 0;

      this.edgeIsOnMap = false;

      //this.processVertexClick = this.processVertexClick.bind(this);
      
      this.eventRectangle.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick(e);
      }.bind(this));      
    }

    
    scale(scale) {
      this.edgeWidth *= scale;
      this.edgeImageWidth *= scale;
      this.calculateEdgeRectangles();
    }

    
    addToMap() {
      if (!this.edgeIsOnMap) {
        this.path.map.geoObjects.add(this.eventRectangle);         
        this.path.map.geoObjects.add(this.image);    
        this.edgeIsOnMap = true;
      }
    }

    removeFromMap() {
      if (this.edgeIsOnMap) {
        this.path.map.geoObjects.remove(this.eventRectangle);         
        this.path.map.geoObjects.remove(this.image);    
        this.edgeIsOnMap = false;
      }
    }


    getChuteDirection() {
      return this.chuteDirection;
    }
    
    getColor() {
      var color = this.chuteDirection ? "#0000FF" : "#000050";
      return color;
    }

    setColor(color) {
      this.image.options.set('strokeColor', color);
      this.image.options.set('fillColor', color);
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
     * Run this function when geometric parameters of prevVertex or nextVertex are changed. 
     * It will recalculate Edge parameters.
     */
    calculateEdgeRectangles() {
      var pointA = this.prevVertex.getCoordinates();
      var pointB = this.nextVertex.isTriangleVertex ?   
        this.nextVertex.image.getEdgePoint() : this.nextVertex.getCoordinates();
      
      var vertices = 
        this.calculateRectangleVertices(pointA, pointB, this.edgeWidth);

      this.eventRectangle.geometry.setCoordinates([vertices]);        
      
      var imageVertices = 
        this.calculateRectangleVertices(pointA, pointB, this.edgeImageWidth);

      this.image.geometry.setCoordinates([imageVertices]);           
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
  provide(Edge);  
}); 