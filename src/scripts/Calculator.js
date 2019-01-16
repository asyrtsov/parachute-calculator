/** @module Calculator */
ymaps.modules.define('Calculator', [
  'VectorMath', 
  'Circle'
],
function(provide, VectorMath, Circle) {
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
    //constructor(path, chute, windList, startHeight, finalHeight) {
    constructor(path, chute, windList, boundaryHeights) {            
      this.path = path;
      this.chute = chute;
      this.windList = windList;
      
      
      //this.startHeight = startHeight;
      //this.finalHeight = finalHeight;

      //this.startHeight = boundaryHeights.startHeight;
      //this.finalHeight = boundaryHeights.finalHeight;

      this.boundaryHeights = boundaryHeights;
      
                  
      // Array of heights in all vertices of path.
      this.height = [];        
    }
     
    /*     
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
    }    */

    getHeight() {
      return(this.height);
    }





    /**
     * Condition for using this function: path.length > 0
     */
    calculateHeight() {
      
      if (this.path.getPathDirection()) {
        this.calculateHeightForward()
      } else {
        this.calculateHeightBack();
      }        


      //return(this.height);          
    }



    calculateHeightForward() {
      
      var height = [this.boundaryHeights.startHeight];
      
      
      if (this.path.length < 2) {
        this.height = height;
        return;
      }        
      
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;
                                  
      var wind = windList.lastWind;
      
      // Skip winds without heights 
      while(wind.getHeight() == null) {
        wind = wind.prevWind;
      }
      
      // Skip to wind corresponding to first vertex      
      if (wind.getHeight() > height[0]) {      
        while(true) {
          if ((wind == windList.firstWind) || 
              (wind.getHeight() + wind.prevWind.getHeight())/2 < height[0]) break; 
          wind = wind.prevWind;
        }   
      }
     

     
      var currentVertex = path.firstVertex, 
          nextVertex = currentVertex.nextVertex;
          
      var pointA = currentVertex.geometry.getCoordinates();
      var pointB = nextVertex.geometry.getCoordinates();

      var i = 1;  // vertex index: i(firstVertex) = 0, ..
      
      var edgeChuteTime = 0;  // time of flying through edge
      
      while(true) {
        
        
        console.log("wind height: " + wind.getHeight());
        
                                     
        var edgeChuteVelocity = 
          this.calculateChuteEdgeVelocity(pointA, pointB, chute, wind); 
          
          
        console.log("edgeChuteVelocity: " + edgeChuteVelocity);  
          

        if (edgeChuteVelocity < 0) {
          // Case: impossible to fly this edge (and so, this path)          
          for(var j=i; j<path.length; j++) {
            height[j] = null;
          } 
          break;
        } 
        
        if (edgeChuteVelocity == 0) {
          // Case: chute is hanging above pointA
          if (wind != windList.firstWind) {
            var wh = (wind.getHeight() + wind.prevWind.getHeight())/2;            
            var t2 = wh / chute.verticalVel;
            edgeChuteTime += t2;
            wind = wind.prevWind;            
            continue;            
          } else {            
            for(var j=i; j<path.length; j++) {
              height[j] = null;
            } 
            break;                          
          }

          /*            
          if (wind.prevWind != null) {
            wind = wind.prevWind;
            edgeChuteTime += t2;
            continue;
          } else {
            for(var j=i; j<path.length; j++) {
              height[j] = null;
            } 
            break;             
          }   */           
        }
                             
        if (edgeChuteVelocity > 0) {
          
          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
          
          var t1 = dist / edgeChuteVelocity;
          
          var t2 = null;
          
          if (wind != windList.firstWind) {          
            var wh = (wind.getHeight() + wind.prevWind.getHeight())/2;            
            t2 = wh / chute.verticalVel;
            
            console.log("t1: " + t1 + ", t2: " + t2);
          }  
          
          if ((wind == windList.firstWind) || 
              ((wind != windList.firstWind) && (t2 >= t1))) {
            // Case: with current wind, chute will reach pointB
            
            edgeChuteTime += t1;
            
            height[i] = 
              height[i-1] - edgeChuteTime * this.chute.verticalVel;
            
            if (nextVertex == path.lastVertex) break;
            
            currentVertex = nextVertex;
            nextVertex = currentVertex.nextVertex;
            
            pointA = currentVertex.geometry.getCoordinates();
            pointB = nextVertex.geometry.getCoordinates();              
            
            i++;              
            edgeChuteTime = 0;
            continue;  
          } else {
            var v = VectorMath.subVectors(pointB, pointA);
            v = VectorMath.normaliseVector(v);
            v = VectorMath.multVectorConstant(v, t2 * edgeChuteVelocity);
                         
            pointA = VectorMath.addVectors(pointA, v); 
            
            
            console.log("circle");
            var p = new Circle([pointA, 10]);
            this.path.map.geoObjects.add(p);
            
            
            
            
            
            edgeChuteTime += t2;
            
            wind = wind.prevWind;
            
            continue;
          }
        }
                
      }

      this.boundaryHeights.finalHeight = height[height.length - 1];
      
      this.height = height;
      
      return;  
    }
    


    
    calculateHeightBack() {

      var currentVertex = path.lastVertex;
      
      this.height[path.length - 1] = this.boundaryHeights.finalHeight;        
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
      
      this.boundaryHeights.startHeight = this.height[0];    
    }

    
    

    /** 
     * Calculate Absolute (relatively to Earth) Chute Velocity 
     * along Line Segment (Edge).
     * @param {number[]} pointA - Yandex Maps Coordinates: (latitude, longitude).
     * @param {number[]} pointB - Yandex Maps Coordinates: (latitude, longitude). 
     * @param {Chute} chute 
     * @param {Wind} wind     
     * @return {number} chuteEdgeVelocity - Absolute Chute Velocity along 
     * line segment [pointA, pointB]; in m/sec; 
     * Cases: chuteEdgeVelocity < 0 - If it is impossible to fly this segment;
     * chuteEdgeVelocity == 0 - hanging above pointA all time;    
     * chuteEdgeVelocity > 0 - chute will fly from pointA to pointB.
     */    
    calculateChuteEdgeVelocity(pointA, pointB, chute, wind) {
          
      // Let's find right orthonormal basis (e, f), first vector of which (e)
      // has the same direction with vector [pointA, pointB].      
      // Yandex Maps Coordinates: (latitude, longitude)
      // Latitude is increasing from bottom to top (-90deg, 90deg)
      // Longitude is increasing from West to East (-180deg, 180deg)
            
      function sign(a) {
        if (a>0) return 1;
        if (a==0) return 0;
        return -1;
      }      
      
      var sx = sign(pointB[1] - pointA[1]);
      var sy = sign(pointB[0] - pointA[0]);       
    
      var pointC = [pointA[0], pointB[1]];
      
      // now (ex, ey) are coordinates of vector e in standart orthonormal basis:
      // x has direction from left to right, 
      // y has direction from bottom to top, 
      // scale: 1 meter
      var ex = sx * ymaps.coordSystem.geo.getDistance(pointC, pointA);
      var ey = sy * ymaps.coordSystem.geo.getDistance(pointC, pointB);
                
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
      
      // We consider only case, where ce >= 0 
      // (it's always the case, if chute velocity is greater than wind velocity)    
      // In general case you should consider case, 
      // when ce < 0 (case when diver flies forward with his back)   

      var chuteEdgeVelocity = ce + we;
      return(chuteEdgeVelocity);       
    }














    
     
    
    /**
     * Condition for using this function: path.length > 0
     */
    calculateHeight1() {
      
      var path = this.path;      
      
      this.height = [];      

      if (path.getPathDirection()) {
        // Calculations in direct direction
        
        var currentVertex = path.firstVertex;
               
        //this.height[0] = this.startHeight;
        this.height[0] = this.boundaryHeights.startHeight;
        
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

        //this.finalHeight = this.height[this.height.length - 1];
        this.boundaryHeights.finalHeight = this.height[this.height.length - 1];        
        
      } else {
        // Calculations in back direction        
        
        var currentVertex = path.lastVertex;
        
        //this.height[path.length - 1] = this.finalHeight;
        this.height[path.length - 1] = this.boundaryHeights.finalHeight;        
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
        
        //this.startHeight = this.height[0];
        this.boundaryHeights.startHeight = this.height[0];        
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
            
      var wind = this.windList.firstWind; 
      
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