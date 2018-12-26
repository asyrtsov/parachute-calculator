ymaps.modules.define('Wind', [
  'Constant'
],
function(provide, Constant) {

  class Wind {
    /** 
     * Wind in polar coordinate system.
     * @param {number} value - in m/sec.
     * @param {number} angle - between current wind and west wind, in degree.     
     */
    constructor(value, angle) {
      this.setValue(value);
      this.setAngle(angle);      
    }
    
    /**
     * this.angle will be in interval (-180, 180] degrees.
     */
    setAngle(angle) {
      
      angle = Math.floor(angle); 
            
      if (angle >= 0) {
        angle = angle % 360;
      } else {
        // negative angle case
        angle = angle * (-1);
        angle = angle % 360;
        angle = 360 - angle;        
      }
      
      if (angle > 180) {
        angle -= 360;
      }        
             
      this.angle = angle;              
    }
    
    /**
     * @return {boolean} - It returns false if value was out of 
     * permitted values.
     */
    setValue(value) {      
      if ((value > Constant.maxWindValue) || (value < 0)) return(false);      
      this.value = value;
      return(true);      
    }
     
    getAngle() {
      return(this.angle);
    }
    
    getValue() {
      return(this.value);
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
      
      return(direction);     
    }        
  }
      
  provide(Wind);  
});      
      