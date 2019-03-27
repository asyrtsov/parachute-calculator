/** @module Calculator */
ymaps.modules.define('Calculator', [
  'VectorMath', 
  'Constant'
],
function(provide, VectorMath, Constant) {
  /**
   * This class calculates: 
   * a) heights at all vertices of the Path 
   * (it will be kept in vertex.height varialables where vertex belongs 
   * to Path), 
   * b) points on the Path where wind changes (it will be kept in 
   * wind.pathPoint varialables where wind belongs to WindList). 
   * Calculation can be done from start vertex to final vertex or 
   * vice versa. Direction of calculation is determined by 
   * calculationDirection varialable.
   */
  class Calculator {
    /**
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Chute} chute - Chute velocity.     
     * @param {WindList} windList
     * @param {BoundaryHeights} boundaryHeights     
     */
    constructor(path, chute, windList, boundaryHeights) {            
      this.path = path;
      this.chute = chute;
      this.windList = windList;      

      this.boundaryHeights = boundaryHeights;

      // 'true' for calculation from the beginning of Path to the end of Path, 
      // 'false' for calculation from the end of Path to the beginning of Path.       
      //this.calculationDirection = boundaryHeights.calculationDirection;
    }

    getCalculationDirection() {
      return this.boundaryHeights.getCalculationDirection();      
    }    
    
    setCalculationDirection(calculationDirection) {
      this.boundaryHeights.setCalculationDirection(calculationDirection);      
    }
    
    setStartHeight(startHeight) {
      this.boundaryHeights.setStartHeight(startHeight);
    }
    
    setFinalHeight(finalHeight) {
      this.boundaryHeights.setFinalHeight(finalHeight);
    }

    setDefaultHeights() {
      this.boundaryHeights.setDefaultHeights();      
    }
    

    /**
     * Main calculation function.
     * If this.calculationDirection == true, then calculator begins computation 
     * from start vertex and boundaryHeights.startHeight height; 
     * if this.calculationDirection == false, then calculator begins computation 
     * from final vertex and boundaryHeights.finalHeight height.          
     */
    calculateHeight() {
      if (this.path.length == 0) {
        console.warn("Cannot calculate: Path is empty");
        return;
      }  
    
      if (this.boundaryHeights.getCalculationDirection()) {
        this.calculateHeightForward();
      } else {
        this.calculateHeightBack();
      }       
    }
    
    /**
     * Case: forward calculation.
     * It calculates: 1) heights at vertices of Path,  
     * 2) points on Path which corresponding to winds from WindList, 
     * 3) boundaryHeights.finalHeight.  
     */     
    calculateHeightForward() {
                                     
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;

      var wind = windList.lastWind;       
      while(wind != null) {
        wind.pathPoint = null;
        wind = wind.prevWind;
      }           
            
      var vertex = path.firstVertex;
      while(vertex != null) {
        vertex.height = null;
        vertex = vertex.nextVertex;
      }      
            
      // Case: startHeight is undefined (equals null)      
      if (this.boundaryHeights.startHeight == null) {
        this.boundaryHeights.setFinalHeight(null);        
        return;        
      }
          
      var vertexA = path.firstVertex;      
      var pointA = vertexA.geometry.getCoordinates();
      vertexA.height = this.boundaryHeights.startHeight; 
            
      // Skip winds without heights
      // (remember that suface wind always exists)      
      wind = windList.lastWind;
      while(wind.getHeight() == null) {
        wind = wind.prevWind;
      }
      
      // Skip to wind corresponding to first (highest) vertex      
      while(wind.getHeight() >= vertexA.height) {
        
        if (wind.getHeight() == vertexA.height) {
          wind.pathPoint = pointA;  
        }
        if (wind == windList.firstWind) break;
        
        wind = wind.prevWind;
      }

      if (path.length == 1) return;        
                                    
      var vertex = vertexA.nextVertex;
      while(vertex != null) {
        vertex.height = null;
        vertex = vertex.nextVertex;
      } 
      
      var vertexB = vertexA.nextVertex;
      
      // Later, pointA can be any point of edge, 
      // pointB always will be vertex, 
      // pointA and pointB belong to the one edge 
      var pointB = vertexB.geometry.getCoordinates();      
      var pointAHeight = vertexA.height;
      
      while(true) {
        
        // edgeChuteVelocity is velocity along edge [pointA, pointB] at pointA.
        // 'wind' is a wind in pointA. 
        // Our aim is to calculate height in pointB.       
        var edgeChuteVelocity = 
          this.calculateChuteEdgeVelocity(pointA, pointB, chute, wind); 
                                                                               
        if (edgeChuteVelocity < 0) break;

        // Case: chute is hanging above pointA
        // This is top boundary of previous wind        
        if (edgeChuteVelocity == 0) {
          if (wind != windList.firstWind) {
            pointAHeight = wind.getHeight();
            wind.pathPoint = pointA;             
            wind = wind.prevWind;            
            continue;
          } else break;          
        }
                                       
        if (edgeChuteVelocity > 0) {
          
          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
          var t1 = dist / edgeChuteVelocity;
          
          if (wind != windList.firstWind) {
          
            var t2 = (pointAHeight - wind.getHeight()) / chute.verticalVel;
                        
            if (t2 >= t1) {
              // Case: with current wind, chute will reach (vertex) pointB
                                                                      
              vertexB.height = pointAHeight - t1 * this.chute.verticalVel;
                            
              if (t2 == t1) {
                wind.pathPoint = pointB;
                wind = wind.prevWind;                
              } 
                            
              if (vertexB == path.lastVertex) break;
              
              vertexA = vertexB;
              vertexB = vertexA.nextVertex;
              
              pointA = vertexA.geometry.getCoordinates();
              pointB = vertexB.geometry.getCoordinates();  

              pointAHeight = vertexA.height;  
              
              continue;
              
            } else {              
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
              
              pointA = VectorMath.findIntermediatePoint(
                pointA, pointB, (t2 * edgeChuteVelocity)/dist
              );
              
              pointAHeight -= t2 * this.chute.verticalVel;
                            
              wind.pathPoint = pointA;                                                                      
              wind = wind.prevWind;
              
              continue;
            }

          } else {
            // case: wind = windList.firstWind
                        
            if (t1 > Constant.maxFlightTime) break;
                   
            vertexB.height = pointAHeight - t1 * this.chute.verticalVel;
                                    
            if (vertexB.height == 0) {
              wind.pathPoint = pointB;
            }
                             
            if (pointAHeight > 0 && vertexB.height < 0) {                   
              wind.pathPoint = 
                VectorMath.findIntermediatePoint(
                  pointA, pointB,  pointAHeight/(pointAHeight - vertexB.height)
                );              
            }                 
                                                                                  
            if (vertexB == path.lastVertex) break;
            
            vertexA = vertexB;
            vertexB = vertexA.nextVertex;
            
            pointA = vertexA.geometry.getCoordinates();
            pointB = vertexB.geometry.getCoordinates();  

            pointAHeight = vertexA.height;              

            continue;                  
          }          
        }               
      }
      
      this.boundaryHeights.setFinalHeight(path.lastVertex.height);       
    }
    

    /**
     * Case: back calculation.
     * It calculates: 1) heights at vertices of Path,  
     * 2) points on Path which corresponding to winds from WindList, 
     * 3) boundaryHeights.startHeight.    
     */    
    calculateHeightBack() {
      
      //console.log("back computation");
      
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;

      var wind = windList.firstWind;       
      while(wind != null) {
        wind.pathPoint = null;
        wind = wind.nextWind;
      }           

      var vertex = path.firstVertex;
      while(vertex != null) {
        vertex.height = null;
        vertex = vertex.nextVertex;
      }      
      
      // Case: finalHeight is undefined (equals null)
      if (this.boundaryHeights.finalHeight == null) {
        this.boundaryHeights.setStartHeight(null);        
        return;    
      }    
                    
      var vertexB = path.lastVertex;      
      var pointB = vertexB.geometry.getCoordinates();
      vertexB.height = this.boundaryHeights.finalHeight; 

      wind = windList.firstWind;      
      if (wind.getHeight() < vertexB.height) {
        // that is, 0 < vertexB.height
            
        while(true) {
                    
          if (wind.nextWind == null) break;          
          if (wind.nextWind.getHeight() == null) break;
          
          if (wind.nextWind.getHeight() > vertexB.height) break;
          
          if (wind.nextWind.getHeight() == vertexB.height) {
            wind = wind.nextWind;
            wind.pathPoint = pointB;
            break;
          }
          
          wind = wind.nextWind;          
        }   
      }  

      if (path.length == 1) return;

      var vertexA = vertexB.prevVertex;
      
      // pointA will always be vertex, 
      // pointB can be vertex or point on the edge      
      var pointA = vertexA.geometry.getCoordinates();
     
      var pointBHeight = vertexB.height;

            
      while(true) {
         
        // Note: here pointA is only for setting direction; 
        // if there will be changing wind on the edge, 
        // the chute will fly with following velocity only after 
        // last changing (in the direction, determined by 
        // vector pointApointB)        
        var edgeChuteVelocity = 
          this.calculateChuteEdgeVelocity(pointA, pointB, chute, wind);
        
        //console.log("edgeChuteVelocity: " + edgeChuteVelocity);
        
        // In this case it is impossible to flight this edge        
        if (edgeChuteVelocity < 0) break;

        // Case: chute is hanging above pointB.          
        // This is bottom boundary of current wind        
        if (edgeChuteVelocity == 0) {
          
          if (wind == windList.lastWind || wind.nextWind.getHeight() == null) {
            break;
          }                   
          
          wind = wind.nextWind;          
          pointBHeight = wind.getHeight();                                      
          wind.pathPoint = pointB;          
          continue;                       
        }
                             
        if (edgeChuteVelocity > 0) {
          
          if (wind != windList.lastWind && wind.nextWind.getHeight() != null) {
          
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
            var t1 = dist / edgeChuteVelocity;
                         
            var t2 = 
              (wind.nextWind.getHeight() - pointBHeight) / chute.verticalVel;
          
            if (t2 >= t1) {
              // Case: with current wind, pointB is reachable from pointA  
            
              //if (t1 > Constant.maxFlightTime) break;
              
              vertexA.height = pointBHeight + t1 * this.chute.verticalVel;
              
              if (
                wind == windList.firstWind 
                && (pointBHeight < 0) 
                && (vertexA.height > 0) 
              ) {
                wind.pathPoint = 
                  VectorMath.findIntermediatePoint(
                    pointA, pointB,  vertexA.height/(vertexA.height - pointBHeight)
                  );            
              }               
                  
              if (vertexA == path.firstVertex) break;
              
              vertexB = vertexA;
              vertexA = vertexB.prevVertex;
              
              pointA = vertexA.geometry.getCoordinates();
              pointB = vertexB.geometry.getCoordinates();

              pointBHeight = vertexB.height;
                                                               
              continue;  
            } else {

              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
                           
              pointB = VectorMath.findIntermediatePoint(
                pointB, pointA, (t2 * edgeChuteVelocity)/dist 
              ); 
             
              pointBHeight += t2 * this.chute.verticalVel;
                                                                      
              wind = wind.nextWind;
              wind.pathPoint = pointB;
              
              continue;
            }
          } else {  
            // case: wind == windList.lastWind || wind.nextWind.getHeight() == null 
            
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
            var t1 = dist / edgeChuteVelocity;
            
            if (t1 > Constant.maxFlightTime) break;
                                    
            vertexA.height = pointBHeight + (t1 * this.chute.verticalVel);

            if (
              wind == windList.firstWind 
              && (pointBHeight < 0) 
              && (vertexA.height > 0) 
            ) {
              wind.pathPoint = 
                VectorMath.findIntermediatePoint(
                  pointA, pointB,  vertexA.height/(vertexA.height - pointBHeight)
                );            
            } 
                                                                      
            if (vertexA == path.firstVertex) break;
            
            vertexB = vertexA;
            vertexA = vertexB.prevVertex;
            
            pointA = vertexA.geometry.getCoordinates();
            pointB = vertexB.geometry.getCoordinates(); 

            pointBHeight = vertexB.height;            

            continue;                     
          }
        }                                
      }

      this.boundaryHeights.setStartHeight(path.firstVertex.height);         
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