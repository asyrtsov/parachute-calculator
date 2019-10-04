ymaps.modules.define('WindOutputElement', [
  'OutputElement'       
],
function(provide, OutputElement) {
  /**
   * Window for outputing Wind value and Wind direction 
   * at particular height.
   * @extends OutputElement
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
    
      //this.data.set("content", "Ветер: h = " + windHeight + "м, " +
      //  wind.getValue() + " м/с, " + wind.getDirection());    

      this.data.set("content", "Поверхностный ветер: " +
        wind.getValue() + " м/с, " + wind.getDirection());          
        

    }           
  } 
  provide(WindOutputElement);  
}); 