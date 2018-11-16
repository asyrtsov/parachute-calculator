ymaps.modules.define('Chute', [],
function(provide) {

  class Chute {
    constructor(horizontalVel, verticalVel) {
      this.horizontalVel = horizontalVel;  // abs value, meters/sec
      this.verticalVel = verticalVel;      // abs value, meters/sec
    }   
  }
      
  provide(Chute);  
});       