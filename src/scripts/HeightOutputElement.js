ymaps.modules.define('HeightOutputElement', [
  'OutputElement'       
],
function(provide, OutputElement) {
  /**
   * Window for outputing height. 
   */
  class HeightOutputElement extends OutputElement {

    /**
     * @param {number} height
     */  
    constructor(height) {
      super();
            
      this.print(height);      
    }
    
    /**
     * @param {number} height
     */
    print(height) {
      
      if (typeof(height) == 'number') {
        this.data.set("content", "Высота: " + Math.floor(height) + " м");               
      } else {
        this.data.set("content", "Высота: неопределена");                
      }
      
      //this.data.set("content", message); 
      /*    
      if (height.length > 0) {      
        if ((height.length == this.path.length) || 
            (this.path.length == 0)) {         
          this.data.set("content", 
            "Высота: " + Math.floor(height[height.length - 1]) + " м");                                                                                     
        } else {
          // Impossible to fly to this vertex          
          this.data.set("content", "Высота: неопределена");
        }
      } */     
    }     
  } 
  provide(HeightOutputElement);  
}); 
