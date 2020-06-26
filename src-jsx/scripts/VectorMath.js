ymaps.modules.define('VectorMath', [],
function(provide) {
  /** Set of functions for working with Sphere (2 dimensional) vectors. */
  class VectorMath {
       
    /**
     * We consider following local cartesian coordinate system: 
     *  axis have the same direction as Latitude-Longtitude, 
     *  axis have the same length (with each other), 
     *  default scale parameter (0.00008) makes this 
     *  coordinate system be of the size we need in our tasks.
     * @param {number[]} geodesicVector - Latitude-Longtitude vector coordinates.
     * @param {number} latitude
     * @param {number} scale - Default value is 0.00008
     * @return {number[]} [vx, vy] - Vector coordinates in cartesian coordinate system.
     */      
    static toLocalVector(geodesicVector, latitude, scale=0.00008) {  
      var vx = geodesicVector[0]/scale;
      var vy = (geodesicVector[1]/scale) * 
                Math.cos((Math.PI/180)*latitude);
      return([vx, vy]);
    }
    
    /**
     * Convert Cartesian coordinate to Latitude-Longtitude coordinates.
     * @param {number[]} localVector - Cartesian vector. 
     * @param {number} latitude
     * @param {number} scale 
     * @return {number[]|0} [vlat, vlon] - [Latitude, Longtitude] or 0 
     *  (if impossible to convert).       
     */
    static toGeodesicVector(localVector, latitude, scale=0.00008) {
      var vlat = localVector[0]*scale;
      var c = Math.cos((Math.PI/180)*latitude);
      if (c == 0) return 0;
      var vlon = (localVector[1]*scale) / c;
      return([vlat, vlon]);
    }

    static normaliseVector(v) {
      var d = Math.sqrt(v[0]**2 + v[1]**2);
      if (d>0) {
        return ([v[0]/d, v[1]/d]);
      } else {        
        return ([0, 0]);
      }
    }

    /**
     * n = (cos(alpha), sin(alpha)), 
     * alpha is angle of rotation
     */
    static rotateVector(v, n) {
      var wx = n[0]*v[0] - n[1]*v[1];
      var wy = n[1]*v[0] + n[0]*v[1];
      return ([wx, wy]);        
    }

    static addVectors(v1, v2) {
      return([v1[0] + v2[0], v1[1] + v2[1]]);
    } 
    
    static subVectors(v1, v2) {
      return([v1[0] - v2[0], v1[1] - v2[1]]);
    }

    static multVectorConstant(v, a) {
      return([v[0]*a, v[1]*a]);
    }

    static scalarProduct(v1, v2) {
      return(v1[0]*v2[0] + v1[1]*v2[1]);      
    }
    
    static length(v) {
      return(Math.sqrt(v[0]*v[0] + v[1]*v[1]));
    }
    
    /**
     * pointA + {pointA, pointB} * t
     */       
    static findIntermediatePoint(pointA, pointB, t) {
      var v = this.subVectors(pointB, pointA);      
      var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);      
      v = this.multVectorConstant(v, t);                   
      var point = this.addVectors(pointA, v);
      return(point);  
    }

    /**
     * 
     * @param {number[]} point - Cartesian coordinates.
     * @returns {Object | null} polarCoordinates - Polar coordinates or null if radius = 0. 
     * @returns {number} polarCoordinates.radius
     * @returns {number} polarCoordinates.angle - Here 0 <= angle < 2*PI.
     */
    static getPolarFromCartesian(point) {
      var x = point[0]; 
      var y = point[1];

      var r = Math.sqrt(x*x + y*y);      
      if (r == 0) return {radius: null, angle: null};
        
      var angle = null;

      if (x > 0) {
        angle = (y >= 0) ? Math.atan(y/x) : (2*Math.PI - Math.atan((-y)/x));
      } else {
        if (x < 0) {
          if (y >= 0) {
            angle = Math.PI - Math.atan(y/(-x));
          } else {
            angle = Math.PI + Math.atan(y/x);
          }
        } else {  // x = 0
          angle = (y > 0) ? Math.PI/2  : Math.PI*(3/2);  
        }
      }  

      //angle = 360 * (angle / (Math.PI*2));  
      var polarCoordinates = {radius: r, angle: angle};
      return polarCoordinates;
    }
                  
  }      
  provide(VectorMath);  
});  