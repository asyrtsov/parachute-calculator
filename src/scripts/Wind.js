ymaps.modules.define('Wind', [],
function(provide) {

  class Wind {
    constructor(value, angle) {
      // polar coordinate system: value in m/sec, angle in degree
      this.value = value;
      this.angle = angle;    
    }

    getXY () {      
      var radiandirection = this.angle * ((2*Math.PI)/360);      
      // vector of wind (vx, vy), meters/sec
      var vx = this.value * Math.cos(radiandirection);
      var vy = this.value * Math.sin(radiandirection);
      return [vx, vy];      
    } 
     
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
      