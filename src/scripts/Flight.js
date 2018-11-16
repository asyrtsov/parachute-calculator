ymaps.modules.define('Flight', [
  'Path' 
],
function(provide, Path) {

  class Flight extends Path {
    constructor(map, wind, chute, startHeight, isMobile) {
      
      // 'super' should be before 'this' 
      super(map, isMobile);

      this.chute = chute;
      this.wind = wind;  
      this.startHeight = startHeight; 

      this.time = [];
      this.totaldist = 0;
      this.flightIsPossible = true;
      this.finalHeight = startHeight;      
    }
    
    setChute(chute) {
      this.chute = chute;
      this.calculatePrintTime();  
    }
    
    setWind(wind) {
      this.wind = wind;
      this.calculatePrintTime();  
    }
    
    setStartHeight(startHeight) {
      this.startHeight = startHeight;
      this.calculatePrintTime();  
    }

    getFlightIsPossible() {
      return(this.flightIsPossible);
    }

    getFinalHeight() {
      return(this.finalHeight);
    }     
    
    addVertex(point) {
      super.addVertex(point);
      this.calculatePrintTime();      
    }
 
    removeVertex(e) {
      super.removeVertex(e);
      this.calculatePrintTime();
    }
    
    clear() {
      super.clear();
      
      this.time = [];
      this.totaldist = 0;
      this.flightIsPossible = true;
      this.finalHeight = this.startHeight;     
    }
    
    calculatePrintTime() {
      this.calculateTime();
      this.printTime();
    }

    calculateTime() {  
      // Method return time array, totaldist
    
      var time = [];      // time of flying along each Path segment (in seconds)
                          // time[i] = -1 if it is impossible to fly i-segment
      var totaldist = 0;  // total distance of Path (in meters)  
                
      var currentVertex = this.firstVertex;
      
      if (this.numberOfVertices > 0) time[0] = 0;
      
      for(var i=1; i < this.numberOfVertices; i++) {
                
        // Let's find right norm basis (e, f), first vector of which
        // has the same direction with vector prevPointcurrentPoint
          
        var nextVertex = currentVertex.nextVertex;
       
        var currentPoint = currentVertex.geometry.getCoordinates();
        var nextPoint = nextVertex.geometry.getCoordinates();        
          
        var dist = ymaps.coordSystem.geo.getDistance(currentPoint, nextPoint);
        
        totaldist += dist;

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
        var [wx, wy] = this.wind.getXY();
     
        var we = wx * ex + wy * ey; 
        var wf = wx * fx + wy * fy;     
         
        // Let's find coordinates (ce, cf) of chute velocity 
        // in basis (e, f):
        
        var cf = (-1)*wf;
        
        if (this.chute.horizontalVel < Math.abs(cf)) {
          time[i] = -1;  // it is impossible to fly this segment
          break;
        }
        
        var ce = Math.sqrt(this.chute.horizontalVel**2 - cf**2);
        
        // We consider only case, where ce > 0
        // (it's always the case, if chute velocity is greater than wind velocity)    
        // In general case you should consider case, 
        // when ce < 0 (case when diver flies forward with his back)   

        if (ce + we <= 0.1) {  // 0.1 m/sec is too small velocity
          time[i] = -1;        // it is impossible to fly this segment
          break;
        } else {
          time[i] = dist / (ce + we);                   
        }

        currentVertex = nextVertex;        
      }
      
      this.time = time;
      this.totaldist = totaldist;         
    }

    printTime() {         
      var [time, totaldist] = [this.time, this.totaldist];
      var flightIsPossible = false;         

      if (time.length == 0) {
        flightIsPossible = true;  // empty Path
      } else {
        if (time[time.length - 1] != -1) flightIsPossible = true;
      }
      
      if (flightIsPossible) {        
        var height = this.startHeight;
        var totaltime = 0;
        var currentVertex = this.firstVertex;
        
        if (time.length > 1) {
          for(var i=0; i<time.length; i++) {
            totaltime += time[i];
            height -= time[i] * this.chute.verticalVel;    

            currentVertex.properties.set("hintContent", "h=" + 
                                         Math.floor(height) + "м");
                                         
            currentVertex.properties.set("ballonContentBody", "h=" + 
                             Math.floor(height) + "м");                                         
                                                                                  
            currentVertex = currentVertex.nextVertex;
          }
        }
         
        this.finalHeight = height;                 
      } 

      this.flightIsPossible = flightIsPossible;          
    }   
  }
      
  provide(Flight);  
});       