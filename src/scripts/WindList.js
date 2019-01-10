ymaps.modules.define('WindList', [
  'Wind'
],
function(provide, Wind) {

  class WindList {
    constructor(map) {
      this.map = map; 
      
      // 5 m/sec, west wind, h = 0 m;
      this.firstWind = new Wind(5, 0, 0);  
      // we add to map corresponding windsock
      this.firstWind.addToMap(this.map);  

      this.currentWind = this.firstWind;
      this.lastWind = this.firstWind;
      this.numberOfWinds = 1;      
    }

    addWind() {
      
      var wind = new Wind(5, 0, null);
      wind.addToMap(this.map);
      
      if (this.lastWind != null) {
        this.lastWind.nextWind = wind;
      }      
      
      wind.prevWind = this.lastWind;
      wind.nextWind = null;
      
      this.lastWind = wind;
      this.currentWind = wind;
      
      
     this.numberOfWinds++;     
    }
    
    removeCurrentWind() {
      
      if (this.numberOfWinds == 1) return;
      
      var wind = this.currentWind;
      
      if ((wind.prevWind != null) && (wind.nextWind != null)) {
        wind.prevWind.nextWind = wind.nextWind;
        wind.nextWind.prevWind = wind.prevWind;      
      } else if (wind.prevWind != null) {
        // lastWind case, number of winds > 1
        wind.prevWind.nextWind = null;
        this.lastVertex = wind.prevWind;
      } else if (wind.nextWind != null) {
        // first Wind case, number of winds > 1
        wind.nextWind.prevWind = null;
        this.firstWind = wind.nextWind;        
      } else {
        this.firstWind = null;
        this.lastWind = null;
      }
      
      wind.removeFromMap(this.map);
      
      this.numberOfWinds--;        
    }
    
    
    moveCurrentPointerToPrev() {
      if (this.numberOfWinds == 1) return;
      if (this.currentWind != this.firstWind) {
        this.currentWind = this.currentWind.prevWind;
      } else {
        this.currentWind = this.lastWind;
      }      
    }
    
    moveCurrentPointerToNext() {
      if (this.numberOfWinds == 1) return;
      if (this.currentWind != this.lastWind) {
        this.currentWind = this.currentWind.nextWind;
      } else {
        this.currentWind = this.firstWind;
      }      
    }
    
    
    
    
    
    
       
  }
      
  provide(WindList);  
});