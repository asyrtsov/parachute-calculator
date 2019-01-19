ymaps.modules.define('WindOutputElement', [
  'OutputElement'       
],
function(provide, OutputElement) {
  /**
   * Window for outputing Wind value and Wind direction.
   */
  class WindOutputElement extends OutputElement {
    
    constructor(wind) {
      super();
      this.print(wind);
    }
    
    /**
     * @param {Wind} wind
     */     
    print(wind) {
      var windHeight = wind.getHeight();
      windHeight = (windHeight == null) ? '?' : windHeight;
    
      this.data.set("content", "Ветер: h = " + windHeight + "м, " +
        wind.getValue() + " м/с, " + wind.getDirection());        
    }           
  } 
  provide(WindOutputElement);  
}); 