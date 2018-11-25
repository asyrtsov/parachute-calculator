ymaps.modules.define('Wind', [],
function(provide) {

  class Wind {
    /** 
     * Wind in polar coordinate system.
     * @param {number} value - in m/sec.
     * @param {number} angle - between current wind and west wind, in degree.     
     */
    constructor(value, angle) {
      this.value = value;
      this.angle = angle;    
    }
    
    /**
     * Calculate wind coordinates in cartesian coordinate system.
     * @return {number[]} [vx, vy] - coordinates, in m/sec.
     */
    getXY () {      
      var radiandirection = this.angle * ((2*Math.PI)/360);       
      var vx = this.value * Math.cos(radiandirection);
      var vy = this.value * Math.sin(radiandirection);
      return [vx, vy];      
    } 
    
    /**
     * Get name of wind direction (E, N, W, S, ...)
     */    
    getDirection() {     
      var angleSwitch = Math.floor((this.angle + 180 + 22)/45);
      var direction;
      
      switch(angleSwitch) {
        case 0: direction = "В"; break;
        case 1: direction = "СВ"; break;
        case 2: direction = "С"; break;
        case 3: direction = "СЗ"; break;
        case 4: direction = "З"; break;
        case 5: direction = "ЮЗ"; break;
        case 6: direction = "Ю"; break;
        case 7: direction = "ЮВ"; break;
        case 8: direction = "В"; break;    
      }
      
      return direction;     
    }        
  }
      
  provide(Wind);  
});      
      