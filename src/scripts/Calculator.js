/** @module Calculator */
ymaps.modules.define('Calculator', [],
function(provide) {
  /**
   * This class calculates heights at all vertices of path.  
   */
  class Calculator {
    /**
     * If path.getPathDirection() == true (that is, we add vertices 
     * to the last vertex), then calculator begins computation 
     * from first vertex and this.startHeight height; 
     * if path.getPathDirection() == false (that is, we add vertices 
     * to first vertex), then calculator begins computation 
     * from lst vertex and this.finalHeight height.
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Wind} wind - Wind velocity.
     * @param {Chute} chute - Chute velocity.
     * @param {number} startHeightDefault - Default Start height of chute, in meters;
     * it is used for Direct computation.
     * @param {number} finalHeightDefault - Default Final Height; it is used for 
     * Back computation.
     */
    constructor(path, windList, chute, startHeight, finalHeight) {      
      this.path = path;
      this.chute = chute;
      this.wind = windList.currentWind;
      
      
      this.startHeight = startHeight;
      this.finalHeight = finalHeight; 
                  
      // Array of heights in all vertices of path.
      this.height = [];        
    }
        
    setStartHeight(startHeight) {
      this.startHeight = startHeight; 
    }

    setFinalHeight(finalHeight) {
      this.finalHeight = finalHeight;  
    }
    
   
    getStartHeight() {
      return(this.startHeight);
    }
    
    getFinalHeight() {
      return(this.finalHeight);
    }    

    getHeight() {
      return(this.height);
    }
    
    
    /**
     * Condition for using this function: path.length > 0
     */
    calculateHeight() {
      
      var path = this.path;      
      
      this.height = [];      

      if (path.getPathDirection()) {
        // Calculations in direct direction
        
        var currentVertex = path.firstVertex;
               
        this.height[0] = this.startHeight;
        
        for(var i=1; i < path.length; i++) {
                              
          var nextVertex = currentVertex.nextVertex;
         
          var currentPoint = currentVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();

          var edgeTime = this.calculateTimeEdge(currentPoint, nextPoint); 
          if (edgeTime == -1) {
            
            for(var j=i; j<path.length; j++) {
              this.height[j] = null;
            } 
            break;
          } else {
            this.height[i] = this.height[i-1] - edgeTime * this.chute.verticalVel;            
          }
          
          currentVertex = nextVertex;         
        }

        this.finalHeight = this.height[this.height.length - 1]; 
        
      } else {
        // Calculations in back direction        
        
        var currentVertex = path.lastVertex;
        
        this.height[path.length - 1] = this.finalHeight;        
        //this.height[path.length - 1] = this.startOrFinalHeight;
                
        for(var i = path.length - 2; i >= 0; i--) {
                              
          var prevVertex = currentVertex.prevVertex;
         
          var currentPoint = currentVertex.geometry.getCoordinates();
          var prevPoint = prevVertex.geometry.getCoordinates();

          var edgeTime = this.calculateTimeEdge(prevPoint, currentPoint); 
          if (edgeTime == -1) {
            for(var j=i; j>=0; j--) {
              this.height[j] = null;
            }
            break;
          } else {
            this.height[i] = this.height[i+1] + edgeTime * this.chute.verticalVel;            
          }

          currentVertex = prevVertex;           
        }
        
        this.startHeight = this.height[0];        
      }

      return(this.height);       
    }


    

    /** 
     * Calculate time of Chute flying along Line Segment (Edge).
     * @param {number[]} pointA - Yandex Maps Coordinates: (latitude, longitude).
     * @param {number[]} pointB - Yandex Maps Coordinates: (latitude, longitude).     
     * @return {number} - Time of flying along line segment [pointA, pointB];      
     * in seconds; If it is impossible to fly this segment, it returns time = 1.
     */    
    calculateTimeEdge(pointA, pointB) {
      
      var chute = this.chute;
      var wind = this.wind; 
      
      var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB); 

      // Let's find right norm basis (e, f), first vector of which (e)
      // has the same direction with vector [pointA, pointB].      
      // Yandex Maps Coordinates: (latitude, longitude)
      // Latitude is increasing from bottom to top (-90deg, 90deg)
      // Longitude is increasing from West to East (-180deg, 180deg)
      var ex = pointB[1] - pointA[1];
      var ey = pointB[0] - pointA[0]; 
                               
      var d = Math.sqrt(ex*ex + ey*ey);
      ex = ex / d;
      ey = ey / d;
      
      var fx = -ey;
      var fy = ex;
      
      // Let's find coordinates (we, wf) of vector 'wind' in basis (e, f).
      // (e, f) is orthogonal basis, so we = (wind, e), wf = (wind, f).
      var [wx, wy] = wind.getXY();
   
      var we = wx * ex + wy * ey; 
      var wf = wx * fx + wy * fy;     
       
      // Let's find coordinates (ce, cf) of chute velocity 
      // in basis (e, f):
      
      var cf = (-1)*wf;
      
      // it is impossible to fly this segment
      if (chute.horizontalVel < Math.abs(cf)) return(-1);
  
      var ce = Math.sqrt(chute.horizontalVel**2 - cf**2);
      
      // We consider only case, where ce > 0 
      // (it's always the case, if chute velocity is greater than wind velocity)    
      // In general case you should consider case, 
      // when ce < 0 (case when diver flies forward with his back)   

      // 0.1 m/sec is too small velocity
      // So, it is impossible to fly this segment        
      if (ce + we <= 0.1) {  
        return(-1);
      } else {
        var time = dist / (ce + we);
        return(time);         
      }     
    }
   
  }
      
  provide(Calculator);  
});       