ymaps.modules.define('YmapsCircleVertex', [
  'Circle'       
],
function(provide, Circle) {
  
  class YmapsCircleVertex extends Circle {
    /**
     * @param {number[]} center - Yandex.Maps coordinates.
     * @param {number} radius     
     */
    constructor(center, radius, zIndex=0) {
      super([center, radius]);
      this.options.set("fillColor", "#0000FF");
      this.options.set("strokeColor", "#0000FF");
      this.options.set("zIndex", zIndex);       
    }
  } 
  provide(YmapsCircleVertex);  
});      
      