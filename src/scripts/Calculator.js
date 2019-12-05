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
   * wind.vertex varialables where wind belongs to WindList). 
   */
  class Calculator {
    /**
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Chute} chute - Chute velocity.     
     * @param {WindList} windList  
     */
    constructor(path, chute, windList) {          
      this.path = path;
      this.chute = chute;
      this.windList = windList;      
    }
    

    /**
     * Main calculation function. 
     */
    calculateHeight(fromBaseToLast = null) {
      if (this.path.length == 0) {
        console.warn("Cannot calculate: Path is empty");
        return;
      }  

      //console.log("Calculated");
    
      switch(fromBaseToLast) {
        case true: 
          this.calculateHeightForward();
          break;
        case false:
          this.calculateHeightBack();
          break;
        case null:
          this.calculateHeightForward();
          this.calculateHeightBack();      
      }
    }

    
    /**
     * Case: calculation from Base Vertex to Last Vertex.
     */     
    calculateHeightForward() {
                                     
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;

      /*    
      var wind = windList.lastWind;       
      while(wind != null) {
        wind.pathPoint = null;
        wind = wind.prevWind;
      }    */      
      
      if (path.baseVertex.nextVertex == null) return;
      
      /*
      var vertex = path.baseVertex.nextVertex;
      while(vertex != null) {
        vertex.height = null;
        //vertex.windPointsArray = [];
        vertex = vertex.nextVertex;
      }      
            
      // Case: startHeight is undefined (equals null)      
      if (this.boundaryHeights.startHeight == null) {
        this.boundaryHeights.setFinalHeight(null);        
        return;        
      }    */
          
      var vertexA = path.baseVertex; 

      var pointA = vertexA.getCoordinates();
      //vertexA.height = this.boundaryHeights.startHeight; 

      // true iff firstWindPoint will be on the Path after calculation.  
      var firstWindHeightIsReached = false;

      var wind = windList.lastWind;

      // Skip winds without heights
      // (remember that suface wind always exists)
      /*      
      while(wind.getHeight() == null) {
        wind = wind.prevWind;
        wind.setPoint(null);      
      } */
      
      // Skip to wind corresponding to base vertex      
      while(wind.getHeight() >= vertexA.height) {
        
        if (wind.getHeight() == vertexA.height) {
          //wind.pathPoint = pointA;
          wind.setPoint(pointA);  
        } else {
          //wind.setPoint(null);
        }

        if (wind == windList.firstWind) break;
        
        wind = wind.prevWind;
      }

      /*
      if (path.length == 1) {
        wind.setPoint(null);
        return;
      }    */
          
      /*
      var vertex = vertexA.nextVertex;
      while(vertex != null) {
        vertex.height = null;
        vertex = vertex.nextVertex;
      } */
      
      var vertexB = vertexA.nextVertex;
                  
      // Later, pointA can be any point of edge, 
      // pointB always will be vertex, 
      // pointA and pointB belong to the one edge 
      var pointB = vertexB.getCoordinates();      
      var pointAHeight = vertexA.height;

      var edgeChuteDirection = vertexA.nextEdge.getChuteDirection();
      
      chute.angleArray = [];    

      while(true) {
        
        //console.log("edgeChuteDirection: " + edgeChuteDirection); 
                
        // edgeChuteVelocity is velocity along edge [pointA, pointB] at pointA.
        // 'wind' is a wind in pointA. 
        // Our aim is to calculate height in pointB.       
        var calcResults = 
          this.calculateChuteVelocity(
            pointA, pointB, chute, wind, edgeChuteDirection
          ); 
                             
        var edgeChuteVelocity = calcResults.chuteEdgeVelocity;  

        //console.log('calculateForward. calculateChuteVelocity: ');
        //console.log(calcResults);


        var velocityAngle = calcResults.polarCoordinates.angle;

        //chute.angleArray.push(velocityAngle);

        //console.log('edgeChuteVelocity: ' + edgeChuteVelocity);   
        
        if (edgeChuteVelocity < 0) break;

        // Case: chute is hanging above pointA
        // This is top boundary of previous wind        
        if (edgeChuteVelocity == 0) {
          if (wind != windList.firstWind) {
            pointAHeight = wind.getHeight();
            //wind.pathPoint = pointA;
            wind.setPoint(pointA);             
            wind = wind.prevWind;            
            continue;
          } else break;          
        }
                                       
        if (edgeChuteVelocity > 0) {

          /* 
          vertexA.windPointsArray.push({
            point: pointA, 
            velocityAngle: velocityAngle
          });     */     


          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
          var t1 = dist / edgeChuteVelocity;
          
          if (wind != windList.firstWind) {
          
            var t2 = (pointAHeight - wind.getHeight()) / chute.verticalVel;
                        
            if (t2 >= t1) {
              // Case: with current wind, chute will reach (vertex) pointB
                                                                      
              //vertexB.height = pointAHeight - t1 * this.chute.verticalVel;              
              vertexB.setHeight(pointAHeight - t1 * this.chute.verticalVel);
              // Blue color.
              vertexB.prevEdge.setColor('#0000FF');
              
              if (t2 == t1) {
                //wind.pathPoint = pointB;
                wind.setPoint(pointB);
                wind = wind.prevWind;                
              } 

              vertexA = vertexB;
              vertexB = vertexB.nextVertex;
              if (vertexB == null) break;
              //if (vertexB == path.lastVertex) break;
              
              //pointA = vertexA.geometry.getCoordinates();
              //pointB = vertexB.geometry.getCoordinates(); 

              pointA = vertexA.getCoordinates();
              pointB = vertexB.getCoordinates(); 

              edgeChuteDirection = vertexA.nextEdge.getChuteDirection();              

              pointAHeight = vertexA.height;  
              
              continue;
              
            } else {              
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
              
              pointA = VectorMath.findIntermediatePoint(
                pointA, pointB, (t2 * edgeChuteVelocity)/dist
              );
              
              // pointAHeight = wind.getHeight();
              pointAHeight -= t2 * this.chute.verticalVel;
                            
              //wind.pathPoint = pointA; 
              wind.setPoint(pointA);                                                                     
              wind = wind.prevWind;
              
              continue;
            }

          } else {
            // case: wind = windList.firstWind
                        
            if (t1 > Constant.maxFlightTime) break;
                   
            //vertexB.height = pointAHeight - t1 * this.chute.verticalVel;
            vertexB.setHeight(pointAHeight - t1 * this.chute.verticalVel);
            // Blue color. 
            vertexB.prevEdge.setColor('#0000FF');
                                    
            if (vertexB.height == 0) {
              //wind.pathPoint = pointB;
              wind.setPoint(pointB);
              firstWindHeightIsReached = true;              
            }
                             
            if (pointAHeight > 0 && vertexB.height < 0) {                   
              //wind.pathPoint = 
              var pointC = VectorMath.findIntermediatePoint(
                pointA, pointB,  pointAHeight/(pointAHeight - vertexB.height)
              );
              wind.setPoint(pointC);
              firstWindHeightIsReached = true;                      
            }                 
            
            vertexA = vertexB;
            vertexB = vertexB.nextVertex;
            if (vertexB == null) break;
            //if (vertexB == path.lastVertex) break;
                        
            pointA = vertexA.getCoordinates();
            pointB = vertexB.getCoordinates();

            edgeChuteDirection = vertexA.nextEdge.getChuteDirection();            

            pointAHeight = vertexA.height;              

            continue;                  
          }          
        }               
      }


      while(vertexB != null) {
        vertexB.setHeight(null);
        // Red color.
        vertexB.prevEdge.setColor('#FF0000');
        vertexB = vertexB.nextVertex;
      };
      
      // Remove last wind points that shouldn't be on the map. 
      if (!firstWindHeightIsReached) {  
        while(wind != null) {
          wind.setPoint(null);
          wind = wind.prevWind;
        }
      } 
    }
    

    /**
     * Case: calculation from Base Vertex to First Vertex.
     */    
    calculateHeightBack() {
      
      var path = this.path, 
          chute = this.chute, 
          windList = this.windList;

      /*    
      var wind = windList.firstWind;       
      while(wind != null) {
        wind.pathPoint = null;
        wind = wind.nextWind;
      } */         
      
      if (path.baseVertex.prevVertex == null) return;

      /*
      var vertex = path.baseVertex.prevVertex;
      while(vertex != null) {
        vertex.height = null;
        vertex = vertex.prevVertex;
      }      
      
      // Case: finalHeight is undefined (equals null)
      if (this.boundaryHeights.finalHeight == null) {
        this.boundaryHeights.setStartHeight(null);        
        return;    
      }    */
                    
      //var vertexB = path.lastVertex;
      var vertexB = path.baseVertex;       
      var pointB = vertexB.getCoordinates();
      //vertexB.height = this.boundaryHeights.finalHeight;


      // true iff lastWindPoint will be on the Path after calculation.  
      var lastWindPointIsShown = false;
      
      var wind = windList.firstWind;      
      if (wind.getHeight() < vertexB.height) {
        // that is, 0 < vertexB.height
            
        while(true) {

          //wind.setPoint(null);
                    
          if (wind.nextWind == null) break;          
          //if (wind.nextWind.getHeight() == null) break;
          
          if (wind.nextWind.getHeight() > vertexB.height) break;
          
          if (wind.nextWind.getHeight() == vertexB.height) {
            wind = wind.nextWind;
            //wind.pathPoint = pointB;
            wind.setPoint(pointB);
            break;
          }
          
          wind = wind.nextWind;          
        }   
      }  

      //if (path.length == 1) return;

      var vertexA = vertexB.prevVertex;
      
      // pointA will always be vertex, 
      // pointB can be vertex or point on the edge      
      var pointA = vertexA.getCoordinates();
     
      var pointBHeight = vertexB.height;

      var edgeChuteDirection = vertexA.nextEdge.getChuteDirection();
            
      while(true) {
         
        // Note: here pointA is only for setting direction; 
        // if there will be changing wind on the edge, 
        // the chute will fly with following velocity only after 
        // last changing (in the direction, determined by 
        // vector pointApointB)        
        var edgeChuteVelocity = 
          this.calculateChuteVelocity(
            pointA, pointB, chute, wind, edgeChuteDirection
          ).chuteEdgeVelocity;
        
        //console.log("edgeChuteVelocity: " + edgeChuteVelocity);
        
        // In this case it is impossible to flight this edge        
        if (edgeChuteVelocity < 0) break;

        // Case: chute is hanging above pointB.          
        // This is bottom boundary of current wind        
        if (edgeChuteVelocity == 0) {
          
          //if (wind == windList.lastWind || wind.nextWind.getHeight() == null) {
          if (wind == windList.lastWind) break;
                            
          
          wind = wind.nextWind;          
          pointBHeight = wind.getHeight();                                      
          //wind.pathPoint = pointB;    
          wind.setPoint(pointB);      
          continue;                       
        }
                             
        if (edgeChuteVelocity > 0) {
          
          //if (wind != windList.lastWind && wind.nextWind.getHeight() != null) {
          if (wind != windList.lastWind) {  
          
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
            var t1 = dist / edgeChuteVelocity;
                         
            var t2 = 
              (wind.nextWind.getHeight() - pointBHeight) / chute.verticalVel;
          
            if (t2 >= t1) {
              // Case: with current wind, pointB is reachable from pointA  
            
              //if (t1 > Constant.maxFlightTime) break;
              
              vertexA.setHeight(pointBHeight + t1 * this.chute.verticalVel);
              // Blue color. 
              vertexA.nextEdge.setColor('#0000FF');
              //vertexA.height = pointBHeight + t1 * this.chute.verticalVel;
              
              if (
                wind == windList.firstWind 
                && (pointBHeight < 0) 
                && (vertexA.height > 0) 
              ) {
                //wind.pathPoint =
                var pointC = VectorMath.findIntermediatePoint(
                  pointA, pointB,  vertexA.height/(vertexA.height - pointBHeight)
                );                    
                wind.setPoint(pointC);  
              }               
              
              vertexB = vertexA;
              vertexA = vertexA.prevVertex;
              if (vertexA == null) break;
              //if (vertexA == path.firstVertex) break;
                            
              pointA = vertexA.getCoordinates();
              pointB = vertexB.getCoordinates();

              pointBHeight = vertexB.height;
              
              edgeChuteDirection = vertexA.nextEdge.getChuteDirection();
                                                               
              continue;  
            } else { 
              // Case: with current wind, pointB is NOT reachable from pointA

              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
                           
              pointB = VectorMath.findIntermediatePoint(
                pointB, pointA, (t2 * edgeChuteVelocity)/dist 
              ); 
             
              pointBHeight += t2 * this.chute.verticalVel;
                                                                      
              wind = wind.nextWind;
              //wind.pathPoint = pointB;
              wind.setPoint(pointB);
              
              continue;
            }
          } else {  
            // case: wind == windList.lastWind
            
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);          
            var t1 = dist / edgeChuteVelocity;
            
            if (t1 > Constant.maxFlightTime) break;
                                    
            vertexA.setHeight(pointBHeight + (t1 * this.chute.verticalVel));
            // Blue color.
            vertexA.nextEdge.setColor('#0000FF');
            //vertexA.height = pointBHeight + (t1 * this.chute.verticalVel);

            if (
              wind == windList.firstWind 
              && (pointBHeight < 0) 
              && (vertexA.height > 0) 
            ) {
              //wind.pathPoint = 
              var pointC = VectorMath.findIntermediatePoint(
                pointA, pointB,  vertexA.height/(vertexA.height - pointBHeight)
              );
              wind.setPoint(pointC);            
            } 
               
            vertexB = vertexA;
            vertexA = vertexA.prevVertex;
            if (vertexA == null) break;
            //if (vertexA == path.firstVertex) break;
                    
            pointA = vertexA.getCoordinates();
            pointB = vertexB.getCoordinates(); 

            pointBHeight = vertexB.height;            

            edgeChuteDirection = vertexA.nextEdge.getChuteDirection();
            
            continue;                     
          }
        }                                
      }

      while(vertexA != null) {
        vertexA.setHeight(null);
        // Red color.
        vertexA.nextEdge.setColor('#FF0000');
        vertexA = vertexA.prevVertex;
      }    


      wind = wind.nextWind; 
      while(wind != null) {
        wind.setPoint(null);
        wind = wind.nextWind;
      }
       


    }

    
    /** 
     * Calculate Polar coordinates of Chute Velocity and 
     * Absolute (relatively to Earth) Chute Velocity along Line Segment 
     * (we suppose that chute is flying along this line segment).
     * @param {number[]} pointA - Yandex Maps Coordinates: (latitude, longitude).
     * @param {number[]} pointB - Yandex Maps Coordinates: (latitude, longitude). 
     * @param {Chute} chute 
     * @param {Wind} wind
     * @param [boolean] edgeChuteDirection - Skydiver can fly with his face directed 
     * with or against edge.
     * @returns {Object} Object       
     * @returns {number} Object.chuteEdgeVelocity - Absolute Chute Velocity along 
     * line segment [pointA, pointB]; in m/sec; 
     * Cases: chuteEdgeVelocity < 0 - If it is impossible to fly this segment;
     * chuteEdgeVelocity == 0 - hanging above pointA all time;    
     * chuteEdgeVelocity > 0 - chute will fly from pointA to pointB.
     * @returns {Object} Object.Object - Polar coordinates of Chute Velocity. 
     * In case, when it is impossible to fly this edge (chuteEdgeVelocity <0), 
     * it will returns polar coordinates of reasonable Chute velocity. 
     * @returns {number} Object.Object.radius
     * @returns {number} Object.Object.angle
     */    
    calculateChuteVelocity(
      pointA, pointB, chute, wind, edgeChuteDirection = true
    ) {
          
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

      // Polar angle of vector (pointA, pointB)  
      var angle1 =  VectorMath.getPolarFromCartesian([ex, ey]).angle;
                
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
      if (chute.horizontalVel < Math.abs(cf)) {
        let polarCoordinates = 
          VectorMath.getPolarFromCartesian([0, sign(cf)*chute.horizontalVel]);
        polarCoordinates.angle += angle1;  
        return({
          chuteEdgeVelocity: -1, 
          polarCoordinates: polarCoordinates
        });
      }  
  
      var directionSign = edgeChuteDirection ? 1 : -1; 
  
      var ce = directionSign * Math.sqrt(chute.horizontalVel**2 - cf**2);
      
      // Polar coordinates of Chute velocity relative to bases {e, f}
      var polarCoordinates = VectorMath.getPolarFromCartesian([ce, cf]);
      // Polar angle of Chute velocity 
      polarCoordinates.angle += angle1;

      //console.log('polarCoordinates: ');
      //console.log(polarCoordinates);

      var chuteEdgeVelocity = ce + we;
      return({
        chuteEdgeVelocity: chuteEdgeVelocity,
        polarCoordinates: polarCoordinates
      });       
    }   
  }
      
  provide(Calculator);  
});       