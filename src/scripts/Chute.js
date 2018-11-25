ymaps.modules.define('Chute', [],
function(provide) {

  class Chute {
    /**
     * @param {number} horizontalVel - Horizontal chute velocity, in m/sec.
     * @param {number} verticalVel - Vertical chute velocity, in m/sec.     
     */
    constructor(horizontalVel, verticalVel) {
      this.horizontalVel = horizontalVel; 
      this.verticalVel = verticalVel;   
    }   
  }
      
  provide(Chute);  
});       