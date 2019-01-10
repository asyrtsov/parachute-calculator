ymaps.modules.define('Wind', [
  'Constant', 
  'Arrow'
],
function(provide, Constant, Arrow) {

  class Wind {
    /** 
     * Wind in polar coordinate system.
     * @param {number} value - in m/sec.
     * @param {number} angle - Angle between current wind and west wind, in degree.     
     * @param {number} height - in meters.
     */
    constructor(value, angle, height) {
      
      this.arrow = new Arrow();        
      
      this.setValue(value);
      this.setAngle(angle);
      this.setHeight(height);     
    }
    
    setHeight(height) {
      console.log(height);
      if (height != null) {
        this.arrow.print(height + "м");
        this.height = height;
      } else {
        this.arrow.print("h = ?");
        this.height = null;
      }        
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
      
      this.arrow.rotate(angle);       
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
    
    getHeight() {
      return(this.height);
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

    addToMap(map) {
      this.arrow.addToMap(map);
    }
    
    removeFromMap(map) {
      this.arrow.removeFromMap(map);
    }
    
  }
      
  provide(Wind);  
});      
      