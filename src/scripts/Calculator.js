/** @module Calculator */
ymaps.modules.define('Calculator', [],
function(provide) {
  /**
   * This class calculates heights at all vertices of path.  
   */
  class Calculator {
    /**
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Wind} wind - Wind velocity.
     * @param {Chute} chute - Chute velocity.
     * @param {number} [startHeight] - Start (and final) height of chute, in meters.
     * @param {boolean} [pathDirection] - If true, calculator calculates 
     * heights from start height, if false - from final height.
     */
    constructor(path, wind, chute, startHeight = 300) {      
      this.path = path;
      this.chute = chute;
      this.wind = wind;
      
      this.startHeight = startHeight;
      this.finalHeight = startHeight;
      
      //this.pathDirection = pathDirection;
  
      // Array of heights in all vertices of path.
      this.height = [];        
    }
        
    setStartHeight(startHeight) {
      if (this.path.getPathDirection()) {
        this.startHeight = startHeight;
        /* this.calculateHeight();
        if (this.height.length > 0) {
          this.finalHeight = this.height[this.height - 1];
        } else {
          this.finalHeight = this.startHeight;
        }  */
      }
      return(this.path.getPathDirection());      
    }

    setFinalHeight(finalHeight) {
      if (!this.path.getPathDirection()) {
        this.finalHeight = finalHeight;
        /*this.calculateHeight();
        
        if (this.height.length > 0) {
          this.startHeight = this.height[0];
        } else {
          this.startHeight = this.finalHeight;
        }   */       
      }
      return(this.path.getPathDirection());      
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
     * Calculate heightes in all vertices of Chute Path.
     * @return {number[]} this.height. 
     * Here height[i]  = height at the ith vertex of Path (in meters).
     * If height.length < path.length than it is impossible
     * to fly this Path.
     */      
    calculateHeight() {
      this.height = [];
      
      if (this.path.length == 0) return(this.height); 
            
      var time = this.calculateTime();
              
      this.height[0] = 0;
            
      for(var i=1; i<time.length; i++) {
        this.height[i] = this.height[i-1] - time[i] * this.chute.verticalVel;
      }
      
      if (this.path.getPathDirection()) {
        for(var i=0; i<this.height.length; i++) {
          this.height[i] += this.startHeight;
        }
        this.finalHeight = this.height[this.height.length - 1];         
        
      } else { 
        var h = this.finalHeight - this.height[this.height.length - 1];
        for(var i=0; i<this.height.length; i++) {
          this.height[i] += h;
        }
        this.startHeight = this.height[0];        
      }
      
      return(this.height);      
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
      //var startHeight = this.startHeight;
      
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