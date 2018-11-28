ymaps.modules.define('YmapsTriangleVertex', [
  'Polygon'    
],
function(provide, Polygon) {
 
  /** 
   * Let point1, point2 - two points with Yandex.maps (geodesic) coordinates. 
   * YmapsTriangleVertex is Yandex maps triangle, 
   * such that vector (point1, point2) and that triangle 
   * form arrow (end of path).
   * Size of arrow is determined by scale varialable. 
   */ 
  class YmapsTriangleVertex extends Polygon {
    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.    
     */
    constructor(point1, point2) {
      // four square brackets is a must, 
      // non empty super constructor is a must     
      super([[point2, point2, point2]]);   
   
      // scale determines arrow size
      this.scale = 0.00008;
            
      this.geometry.setCoordinates([
        this.calculateVertices(point1, point2)
      ]); 
      
      this.options.set("fillColor", "#0000FF");
      this.options.set("strokeColor", "#0000FF");            
    }

    /**
     * @param {number[]} point1 - Yandex.Maps coordinates.
     * @param {number[]} point2 - Yandex.Maps coordinates.    
     */    
    setCoordinates (point1, point2) {
      this.geometry.setCoordinates([
        this.calculateVertices(point1, point2)
      ]);  
    }
    
    /**
     * @param {number[]} point1 - Yandex.Maps point coordinates.
     * @param {number[]} point2 - Yandex.Maps point coordinates.
     * @return {number[][]} p - Array of vertices of YmapsTriangleVertex.      
     */     
    calculateVertices (point1, point2) {
      var scale = this.scale;        
      var latitude = point1[0],
          geodesicArrowVector = subVectors(point2, point1),
          localArrowVector = toLocalVector(geodesicArrowVector, latitude, scale);         

      localArrowVector = normaliseVector(localArrowVector);                
      
      var v = [[-2, 1], [-2, -1], [0, 0]];
      var p = [];                 
      for(var i=0; i<3; i++) {   
        v[i] = rotateVector(v[i], localArrowVector);
        p[i] = addVectors(point2, toGeodesicVector(v[i], latitude, scale));
      }
            
      return(p);
      
      // scale: we want our local coordinates to be 
      // of the same size as 1 (m) for our arrow  
      function toLocalVector(geodesicVector, latitude, scale) {  
        var vx = geodesicVector[0]/scale;
        var vy = (geodesicVector[1]/scale) * 
                  Math.cos((Math.PI/180)*latitude);
        return([vx, vy]);
      }
      
      function toGeodesicVector(localVector, latitude, scale) {
        var vlat = localVector[0]*scale;
        var vlon = (localVector[1]*scale) / 
                    Math.cos((Math.PI/180)*latitude);
        return([vlat, vlon]);
      }

      function normaliseVector(v) {
        var d = Math.sqrt(v[0]**2 + v[1]**2);
        if (d>0) {
          return ([v[0]/d, v[1]/d]);
        }         
        return 0;
      }

      // n = (cos(alpha), sin(alpha)), 
      // alpha is angle of rotation
      function rotateVector(v, n) {
        var wx = n[0]*v[0] - n[1]*v[1];
        var wy = n[1]*v[0] + n[0]*v[1];
        return ([wx, wy]);        
      }

      function addVectors(p1, p2) {
        return([p1[0] + p2[0], p1[1] + p2[1]]);
      } 
      
      function subVectors(p1, p2) {
        return([p1[0] - p2[0], p1[1] - p2[1]]);
      }   
    }        
  }
  
  provide(YmapsTriangleVertex);      
});