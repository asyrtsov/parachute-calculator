ymaps.modules.define('CircleVertex', [
  'Circle'       
],
function(provide, Circle) {
  
  class CircleVertex extends Circle {
    /**
     * @param {number[]} center - Yandex.Maps coordinates.
     * @param {number} radius
     * @param {number} zIndex - z-index of Circle.     
     */
    constructor(center, radius, zIndex=0) {
      super([center, radius]);
      this.options.set("fillColor", "#0000FF");
      this.options.set("strokeColor", "#0000FF");
      this.options.set("zIndex", zIndex);       
    }
  } 
  provide(CircleVertex);  
});      
      