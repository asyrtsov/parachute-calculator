ymaps.modules.define('WindList', ['Wind'],
function(provide, Wind) {
  
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
          
      this.lastWind = this.firstWind;
      this.numberOfWinds = 1;

      this.windVertexRadius = 4;   
      
      this.pathBoundChange = this.pathBoundChange.bind(this);   
      this.map.events.add('boundschange', this.pathBoundChange);      
    }
    
       
    /**
     * Add wind to the List and sort List.
     * @param {Wind} wind
     */ 
    addWind(wind) {      
      this.lastWind.setNextWind(wind);      
      this.lastWind = wind;
      this.numberOfWinds++;
      this.sortList();
    } 
    
    
    /**
     * Remove wind from WindList. 
     * Note: you cannot remove firstWind by construction.
     * @param {Wind} wind - It is supposed that wind belongs to WindList.  
     */
    removeWind(wind) {     
      // First wind, that is, surface wind, cannot be removed
      if (wind == this.firstWind) {
        console.warn("This wind was not removed, because it was firstWind.");
        return;
      }
      
      if (wind.vertex.vertexIsOnMap) {
        wind.vertex.removeFromMap();
      }

      wind.prevWind.setNextWind(wind.nextWind);
      if (wind == this.lastWind) {
        this.lastWind = this.lastWind.prevWind;
      }                                       
      this.numberOfWinds--;         
    }
    
        
    /**
     * Check if this list has a wind with given height.  
     * @param {number} height
     */
    heightIsInList(height) {
      var wind = this.firstWind;
      while(wind != null) {
        if (wind.getHeight() == height) return true;
        wind = wind.nextWind;
      }
      return false;
    }


    /**
     * Bubble sort (it is practical for small list)
     */
    sortList() {

      while(true) {
        var wind = this.firstWind;
        var swapped = false;

        while(wind != this.lastWind) {
          if (wind.height > wind.nextWind.height) {
            this.swapWindAndNextWind(wind);
            swapped = true;          
          } else {
            wind = wind.nextWind;
          }
        }
        if (!swapped) break;
      }
    } 


    /**
     * Print List in console (for development needs)
     */
    printList() {
      console.log('\n\n\n');
      var wind = this.firstWind;
      var i=0;
      while(wind != null) {
        console.log('wind #' + i + ':'); console.log(wind);
        i++;
        wind = wind.nextWind;
      }
    }
    

    /**
     * Swap wind and wind.nextWind.  
     */
    swapWindAndNextWind(wind) { 
      var nextWind = wind.nextWind;
      if (nextWind == null) return;

      nextWind.setPrevWind(wind.prevWind);
      var nextWindNextWind = nextWind.nextWind;
      nextWind.setNextWind(wind);
      wind.setNextWind(nextWindNextWind); 
      
      if (this.firstWind == wind) {
        this.firstWind = nextWind;
      }
      if (this.lastWind == nextWind) {
        this.lastWind = wind;
      }        
    }

    
    removeWindVertices() {
      var wind = this.firstWind;
      while(wind != null) {
        wind.setVertexCoordinates(null);       
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
          wind.vertex.scale(scale);
          wind = wind.nextWind;
        }      
    }
  }
      
  provide(WindList);  
});