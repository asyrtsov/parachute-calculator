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
      this.data.set("content", "Ветер: " + 
        wind.getValue() + " м/с, " + wind.getDirection());        
    }           
  } 
  provide(WindOutputElement);  
}); 