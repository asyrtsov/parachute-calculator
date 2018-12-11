ymaps.modules.define('HeightOutputElement', [
  'OutputElement'       
],
function(provide, OutputElement) {
  /**
   * Window for outputing height in last point of the path. 
   */
  class HeightOutputElement extends OutputElement {
    
    constructor(path, startHeight) {
      super();
      this.path = path;
      
      this.print([startHeight]);      
    }
    
    /**
     * @param {number[]} height
     */
    print(height) {            
      if (height.length > 0) {      
        if ((height.length == this.path.length) || 
            (this.path.length == 0)) {         
          this.data.set("content", 
            "Высота: " + Math.floor(height[height.length - 1]) + " м");                                                                                     
        } else {
          // Impossible to fly to this vertex          
          this.data.set("content", "Высота: неопределена");
        }
      }      
    }     
  } 
  provide(HeightOutputElement);  
}); 
