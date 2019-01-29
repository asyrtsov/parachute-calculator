/** @module Calculator */
ymaps.modules.define('Calculator', [
  'VectorMath', 
  'Circle', 
  'Constant'
],
function(provide, VectorMath, Circle, Constant) {
  /**
   * This class calculates heights at all vertices of path.  
   */
  class Calculator {
    /**
     * If path.getPathDirection() == true (that is, we add vertices 
     * to the last vertex), then calculator begins computation 
     * from first vertex and boundaryHeights.startHeight height; 
     * if path.getPathDirection() == false (that is, we add vertices 
     * to first vertex), then calculator begins computation 
     * from last vertex and boundaryHeights.finalHeight height.
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Chute} chute - Chute velocity.     
     * @param {WindList} windList 
     * @param {Object} boundaryHeights
     * @param {number} boundaryHeights.startHeight - Default Start height of chute, in meters;
     * it is used for Direct computation (from start vertex to final vertex of the path).
     * @param {number} boundaryHeights.finalHeight - Default Final Height; it is used for 
     * Back computation (from final vertex to start vertex of the path).
     */
    constructor(path, chute, windList, boundaryHeights) {            
      this.path = path;
      this.chute = chute;
      this.windList = windList;      
      this.boundaryHeights = boundaryHeights;
                      
      // Array of heights in all vertices of path.
      this.height = [];        
    }
     

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
    }


    calculateHeightForward() {
                 
      if (this.path.length < 2) {
        this.height = [this.boundaryHeights.startHeight];
        return;
      } 

      var height = [this.boundaryHeights.startHeight];
        
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;
                                  
      var wind = windList.lastWind;
      
      // Skip winds without heights 
      while(wind.getHeight() == null) {
        wind = wind.prevWind;
      }
      
      // Skip to wind corresponding to first vertex      
      while(wind != windList.firstWind && wind.getHeight() > height[0]) {
        wind = wind.prevWind;
      }
      
      var vertexA = path.firstVertex, 
          vertexB = vertexA.nextVertex;
          
      var pointA = vertexA.geometry.getCoordinates();
      var pointB = vertexB.geometry.getCoordinates();

      var heightIndex = 1;  // index for array height
     
      var pointAHeight = height[0];

      
      while(true) {
                
        console.log("wind height: " + wind.getHeight());
                                             
        var edgeChuteVelocity = 
          this.calculateChuteEdgeVelocity(pointA, pointB, chute, wind); 
                    
        console.log("edgeChuteVelocity: " + edgeChuteVelocity);  
          
        if (edgeChuteVelocity < 0) {
          // Case: impossible to fly this edge (and so, this path)          
          for(var j = heightIndex; j < path.length; j++) {
            height[j] = null;
          } 
          break;
        } 
        
        if (edgeChuteVelocity == 0) {
          // Case: chute is hanging above pointA
          if (wind == windList.firstWind) {
            // Case of firstWind: it is impossible to fly such path           
            for(var j = heightIndex; j < path.length; j++) {
              height[j] = null;
            } 
            break;                        
          } else {            
            // This is bottom boundary of current wind
            pointAHeight = wind.getHeight();                         
            wind = wind.prevWind;            
            continue;     
          }         
        }
                             
        if (edgeChuteVelocity > 0) {
          
          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
          var t1 = dist / edgeChuteVelocity;
          
          
          if (wind == windList.firstWind) {

            if (t1 > Constant.maxFlightTime) {
              for(var j = heightIndex; j < path.length; j++) {
                height[j] = null;
              } 
              break;
            }
            
            pointAHeight -= t1 * this.chute.verticalVel;
            
            height[heightIndex] = pointAHeight;
                             
            if (vertexB == path.lastVertex) break;
            
            vertexA = vertexB;
            vertexB = vertexA.nextVertex;
            
            pointA = vertexA.geometry.getCoordinates();
            pointB = vertexB.geometry.getCoordinates();              

            heightIndex++;
            
            continue;
            
          } else {  // wind != windList.firstWind
                                     
            var t2 = (pointAHeight - wind.getHeight()) / chute.verticalVel;
                         
            if (t2 >= t1) {
              // Case: with current wind, chute will reach pointB
                            
              if (t1 > Constant.maxFlightTime) {
                for(var j = heightIndex; j < path.length; j++) {
                  height[j] = null;
                } 
                break;
              }
              
              pointAHeight -= t1 * this.chute.verticalVel;
              
              height[heightIndex] = pointAHeight;
                                 
              if (vertexB == path.lastVertex) break;
              
              vertexA = vertexB;
              vertexB = vertexA.nextVertex;
              
              pointA = vertexA.geometry.getCoordinates();
              pointB = vertexB.geometry.getCoordinates();              
                       
              heightIndex++;    
                          
              continue;  
            } else {
              var v = VectorMath.subVectors(pointB, pointA);
              
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
              
              v = VectorMath.multVectorConstant(v, (t2 * edgeChuteVelocity)/dist);
                           
              pointA = VectorMath.addVectors(pointA, v);
              
              pointAHeight -= t2 * this.chute.verticalVel;
              
              //this.path.map.geoObjects.remove(this.p);              
              //this.p = new Circle([pointA, 10]);
              //this.path.map.geoObjects.add(this.p);
                                                        
              wind = wind.prevWind;
              
              continue;
            }     
          }          
        }                
      }

      this.boundaryHeights.finalHeight = height[height.length - 1];      
      this.height = height;      
      return;  
    }
    


    
    calculateHeightBack() {


    
      if (this.path.length < 2) {
        this.height = [this.boundaryHeights.finalHeight];
        return;
      } 

      var height = [];

      height[this.path.length - 1] = this.boundaryHeights.finalHeight;
        
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;
                                  
      var wind = windList.firstWind;
      
      /*
      // Skip winds without heights 
      while(wind.getHeight() == null) {
        wind = wind.prevWind;
      } */
      
      // Skip to wind corresponding to final vertex      
      while(wind != windList.lastWind && 
            wind.getHeight() <= height[path.length-1]) {
        wind = wind.nextWind;
      }   
      
      var vertexB = path.lastVertex, 
          vertexA = vertexB.prevVertex;
          
      var pointB = vertexB.geometry.getCoordinates(),
          pointA = vertexA.geometry.getCoordinates();

      var heightIndex = path.length - 2;  // index for array height
     
      var pointAHeight = height[path.length - 1];

      
      while(true) {
                
        console.log("wind height: " + wind.getHeight());
                                             
        var edgeChuteVelocity = 
          this.calculateChuteEdgeVelocity(pointA, pointB, chute, wind); 
                    
        console.log("edgeChuteVelocity: " + edgeChuteVelocity);  
          
        if (edgeChuteVelocity < 0) {
          // Case: impossible to fly this edge (and so, this path)          
          for(var j = heightIndex; j >= 0; j--) {
            height[j] = null;
          } 
          break;
        } 
        
        if (edgeChuteVelocity == 0) {
          // Case: chute is hanging above pointA
          if (wind == windList.firstWind) {
            // Case of firstWind: it is impossible to fly such path           
            for(var j = heightIndex; j >= 0; j--) {
              height[j] = null;
            } 
            break;                        
          } else {            
            // This is bottom boundary of current wind
            pointAHeight = wind.getHeight();                         
            wind = wind.prevWind;            
            continue;     
          }         
        }
                             
        if (edgeChuteVelocity > 0) {
          
          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
          var t1 = dist / edgeChuteVelocity;
          
          
          if (wind == windList.firstWind) {

            if (t1 > Constant.maxFlightTime) {
              for(var j = heightIndex; j < path.length; j++) {
                height[j] = null;
              } 
              break;
            }
            
            pointAHeight -= t1 * this.chute.verticalVel;
            
            height[heightIndex] = pointAHeight;
                             
            if (vertexB == path.lastVertex) break;
            
            vertexA = vertexB;
            vertexB = vertexA.nextVertex;
            
            pointA = vertexA.geometry.getCoordinates();
            pointB = vertexB.geometry.getCoordinates();              

            heightIndex++;
            
            continue;
            
          } else {  // wind != windList.firstWind
                                     
            var t2 = (pointAHeight - wind.getHeight()) / chute.verticalVel;
                         
            if (t2 >= t1) {
              // Case: with current wind, chute will reach pointB
                            
              if (t1 > Constant.maxFlightTime) {
                for(var j = heightIndex; j < path.length; j++) {
                  height[j] = null;
                } 
                break;
              }
              
              pointAHeight -= t1 * this.chute.verticalVel;
              
              height[heightIndex] = pointAHeight;
                                 
              if (vertexB == path.lastVertex) break;
              
              vertexA = vertexB;
              vertexB = vertexA.nextVertex;
              
              pointA = vertexA.geometry.getCoordinates();
              pointB = vertexB.geometry.getCoordinates();              
                       
              heightIndex++;    
                          
              continue;  
            } else {
              var v = VectorMath.subVectors(pointB, pointA);
              
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
              
              v = VectorMath.multVectorConstant(v, (t2 * edgeChuteVelocity)/dist);
                           
              pointA = VectorMath.addVectors(pointA, v);
              
              pointAHeight -= t2 * this.chute.verticalVel;
              
              //this.path.map.geoObjects.remove(this.p);              
              //this.p = new Circle([pointA, 10]);
              //this.path.map.geoObjects.add(this.p);
                                                        
              wind = wind.prevWind;
              
              continue;
            }     
          }          
        }                
      }

      this.boundaryHeights.finalHeight = height[height.length - 1];      
      this.height = height;      
      return;      

    }

    
    

    /** 
     * Calculate Absolute (relatively to Earth) Chute Velocity 
     * along Line Segment (we suppose that chute is flying along this line segment).
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
   
  }
      
  provide(Calculator);  
});       