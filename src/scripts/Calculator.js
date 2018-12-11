/** @module Calculator */
ymaps.modules.define('Calculator', [],
function(provide) {

  class Calculator {
    /**
     * @param {Path} path - list of vertices and line segments of Chute Path.
     * @param {Wind} wind - wind velocity
     * @param {Chute} chute - chute velocity
     * @param {number} startHeight - start height of chute, in meters.   
     */
    constructor(path, wind, chute, startHeight) {      
      this.path = path;
      this.chute = chute;
      this.wind = wind;  
      this.startHeight = startHeight;      
    }
        
    setStartHeight(startHeight) {
      this.startHeight = startHeight;
    }
    
    getStartHeight() {
      return(this.startHeight);
    }
    
    /** 
     * Calculate heightes in vertices of Chute Path.
     * @return {number[]} height. 
     * Here height[i]  = height at the ith vertex of Path (in meters).
     * If height.length < path.length than it is impossible
     * to fly this Path.
     */      
    calculateHeight() {
      var height = [];
      var time = this.calculateTime();
      
      height[0] = this.startHeight;
      for(var i=1; i<time.length; i++) {
        height[i] = height[i-1] - time[i] * this.chute.verticalVel;
      }
      
      return(height);
    }

    /** 
     * Calculate time of Chute flying along Path. In Path vertices.  
     * @return {number[]} time.
     * Here time[i]  = time of flying along ith segment of Path (in seconds).
     * If time.length < path.length, than it is impossible
     * to fly this Path.
     */    
    calculateTime() {  
    
      var time = [];  
                                                 
      var path = this.path;
      var chute = this.chute;
      var wind = this.wind;
      var startHeight = this.startHeight;
      
      var currentVertex = path.firstVertex;
      
      if (path.length > 0) time[0] = 0;
      
      for(var i=1; i < path.length; i++) {
                
        // Let's find right norm basis (e, f), first vector of which
        // has the same direction with vector {prevPoint, currentPoint}
          
        var nextVertex = currentVertex.nextVertex;
       
        var currentPoint = currentVertex.geometry.getCoordinates();
        var nextPoint = nextVertex.geometry.getCoordinates();        
          
        var dist = ymaps.coordSystem.geo.getDistance(currentPoint, nextPoint);
        
        // Yandex Maps Coordinates: (latitude, longitude)
        // Latitude is increasing from bottom to top (-90deg, 90deg)
        // Longitude is increasing from West to East (-180deg, 180deg)
        var ex = nextPoint[1] - currentPoint[1];
        var ey = nextPoint[0] - currentPoint[0]; 
                                 
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
        if (chute.horizontalVel < Math.abs(cf)) break;
    
        var ce = Math.sqrt(chute.horizontalVel**2 - cf**2);
        
        // We consider only case, where ce > 0 
        // (it's always the case, if chute velocity is greater than wind velocity)    
        // In general case you should consider case, 
        // when ce < 0 (case when diver flies forward with his back)   

        // 0.1 m/sec is too small velocity
        // So, it is impossible to fly this segment        
        if (ce + we <= 0.1) {  
          break;
        } else {
          time[i] = dist / (ce + we);                   
        }

        currentVertex = nextVertex;        
      }
      
      return(time);        
    }
  }
      
  provide(Calculator);  
});       