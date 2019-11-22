ymaps.modules.define('WindList', [
  'Wind', 
  'WindVertex'
],
function(provide, Wind, WindVertex) {

  /**
   * List of winds at different heights; 
   * always contains wind at height = 0m (surface wind); 
   * that surface wind is always first and cannot be removed.
   * List will be sorted for height (from bottom to top); 
   * all winds should have different heights.
   */
  class WindList {
    constructor(map) {
      this.map = map; 

      // Surface wind: 5 m/sec, West
      var angle = 0;
      this.firstWind = new Wind(5, angle, 0, this.map);
      this.map.windOutput.print(this.firstWind.toString());
      this.map.arrow.rotate(angle);
          
      this.currentWind = this.firstWind;
      this.lastWind = this.firstWind;
      this.numberOfWinds = 1;

      // calculator and path are set up in index.js
      this.calculator = null;
      this.path = null;       

      this.windVertexRadius = 4;   
      
      this.pathBoundChange = this.pathBoundChange.bind(this);   

      this.map.events.add('boundschange', this.pathBoundChange);      
    }
    
       
    setCalculator(calculator) {
      this.calculator = calculator;      
    }
    
    setPath(path) {
      this.path = path;
    }

    /**
     * Create new wind (value = 5, angle = 0, height is unknown) and 
     * add it to the end of the list.
     */
    addWind() {      
      var wind = new Wind(5, 0, null, this.map);
      this.lastWind.setNextWind(wind);      
      this.lastWind = wind;
      this.currentWind = wind;
      this.numberOfWinds++;
    }
    
    
    /**
     * Remove wind from WindList. If wind equals currentWind then 
     * after removing currentWind will be equal currentWind.prevWind.
     * Note: you cannot remove firstWind by construction.
     * @param {Wind} wind - It is supposed that wind belongs to WindList.  
     */
    removeWind(wind = this.currentWind) {
      
      // First wind, that is, surface wind, cannot be removed
      if (wind == this.firstWind) {
        console.warn("This wind was not removed, because it was firstWind.");
        return;
      }
      
      /*
      if (wind.vertex != null) {
        wind.vertex.removeFromMap();
        wind.PathVertex = null;
      } */     


      wind.vertex.removeFromMap();

      wind.prevWind.setNextWind(wind.nextWind);
      if (wind == this.lastWind) {
        this.lastWind = this.lastWind.prevWind;
      }
      
      if (wind == this.currentWind) {
        this.currentWind = wind.prevWind;       
      }
                                    
      this.numberOfWinds--;       
      
      if (this.path.length > 0) {
       this.calculator.calculateHeight();
       this.path.printHeightsAndWindPoints();
      }            
    }
    
    
    /**
     * Set height to this.currentWind (number or null) and then order WindList for heights 
     * (increasing order, null is greater then number).
     * It is supposed that List was ordered before.
     * @param {(number | null)} height - Height of wind.
     * @return {boolean} - False iff:
     *   height is a number and height <= 0m OR 
     *   height is a number and such height has already existed.
     */ 
    setHeightToCurrentWind(height) {
      
      if ((typeof(height) == 'number') && (height <= 0)) {
        return false;
      }      
               
      // Different cones must have different heights  
      if (typeof(height) == 'number') {  
        var wind = this.firstWind;        
        while(true) {
          if ((wind != this.currentWind) && (wind.getHeight() == height)) { 
            return(false);
          }            
          if ((wind == this.lastWind) || (wind.getHeight() == null)) break;          
          wind = wind.nextWind;         
        }
      }     
                        
      var currentWind = this.currentWind;
      
      this.currentWind.setHeight(height);         
      //this.windOutput.print(this.currentWind);
            
      var wind = this.currentWind;
 
      // Order windList by heights (increasing order, 
      // null values are greater than numbers)               
      if (height == null) {         
        while(true) {          
          if (wind.nextWind == null || wind.nextWind.getHeight() == null) break;
          var wind = wind.nextWind;        
        }
         
        this.moveWind(currentWind, wind);
              
      } else {  // height is a number
        
        // Moving in previous order
        if (wind.prevWind.getHeight() == null || 
            height < wind.prevWind.getHeight()) {  
        
          while(true) {
            if (wind.prevWind.getHeight() != null) break; 
            wind = wind.prevWind;       
          }
              
          while(true) {
            if (height > wind.prevWind.getHeight()) break;
            wind = wind.prevWind;
          }
          
          this.moveWind(currentWind, wind.prevWind);
          
        } else {
                
          while(true) {
            if (wind.nextWind == null || wind.nextWind.getHeight() == null ||
                height < wind.nextWind.getHeight()) break;
            wind = wind.nextWind;    
          }
          
          this.moveWind(currentWind, wind);        
        }                        
      }
            
      return true;            
    }
    
    /**
     * Move windA to be next wind for windB;
     * Here both windA and windB belong to windList;
     * Remember, that in WindList first wind always exists. 
     */
    moveWind(windA, windB) {
      if (windA == windB || windA == windB.nextWind) return;
              
      if (windB == this.lastWind) {
        
        windA.nextWind.prevWind = windA.prevWind;
        windA.prevWind.nextWind = windA.nextWind;        
                
        windB.nextWind = windA;
        windA.prevWind = windB;

        this.lastWind = windA;         
      } else if (windA == this.lastWind) {
        
        this.lastWind = windA.prevWind;
        windA.prevWind.nextWind = null;        

        windA.nextWind = windB.nextWind;        
        windB.nextWind.prevWind = windA;
        
        windA.prevWind = windB;
        windB.nextWind = windA;              
      } else {  // both windA and windB are not lastWind
        
        windA.nextWind.prevWind = windA.prevWind;
        windA.prevWind.nextWind = windA.nextWind;         
        
        windA.nextWind = windB.nextWind;        
        windB.nextWind.prevWind = windA;

        windA.prevWind = windB;
        windB.nextWind = windA;                    
      }       
    }
    
        
    setCurrentAngle(angle) {
      this.currentWind.setAngle(angle);
      if (this.currentWind == this.firstWind) {
        this.map.windOutput.print(this.firstWind.toString()); 
        this.map.arrow.rotate(angle);
      }             
    }
    
    setCurrentValue(value) {
      this.currentWind.setValue(value);
      if (this.currentWind == this.firstWind) {
        this.map.windOutput.print(this.firstWind.toString()); 
      }                
    }
    
    
    /**
     * Shift coordinates of all winds in such way 
     * that firstWind's coordinates will be point.
     */ /*
    shiftList(point) {
      var wind = this.firstWind;
      var [x0, y0] = wind.arrow.geometry.getCoordinates();
      var [cx, cy] = point;
      while(true) {
        var [x1, y1] = wind.arrow.geometry.getCoordinates();
        var [x, y] = [x1 - x0 + cx, (y1 - y0) + cy];
        wind.arrow.setCoordinates([x, y]);
        if (wind == this.lastWind) break;
        wind = wind.nextWind;                      
      }      
    }  */
    
    /**
     * 
     */

    /* 
    createWindVertices() {
      
      var wind = this.firstWind;
      while(wind != null) {
        
        if (wind.pathPoint == null) {
          if (wind.vertex != null) {
            wind.vertex.removeFromMap();
            wind.vertex = null;             
          }
        } else {
          if (wind.vertex == null) {
            wind.vertex = new WindVertex(wind, this.map, this.windVertexRadius);
            wind.vertex.addToMap();                        
          } else {
            wind.vertex.refreshCoordinates();              
          }          
        }        
        wind = wind.nextWind;
      }  
    }  */
    
    
    removeWindVertices() {
      var wind = this.firstWind;
      while(wind != null) {
        /*
        if (wind.vertex != null) {        
          wind.vertex.removeFromMap();
          wind.vertex = null;
          wind.pathPoint = null;
        } */
        wind.setPoint(null);       
        wind = wind.nextWind;
      }     
    }


    pathBoundChange(e) {
      var newZoom = e.get('newZoom'),
            oldZoom = e.get('oldZoom');
      if (newZoom != oldZoom) {
        var scale = (2**(oldZoom - newZoom));
        this.scale(scale);
      }
    }
  
  
    scale(scale) {
      this.windVertexRadius *= scale;
        var wind = this.firstWind;
        while (wind != null) {
          /*
          if (wind.vertex != null) {
            wind.vertex.scale(scale);
          } */
          wind.vertex.scale(scale);
          wind = wind.nextWind;
        }      
    }
  }
      
  provide(WindList);  
});