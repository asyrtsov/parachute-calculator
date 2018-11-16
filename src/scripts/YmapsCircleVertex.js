ymaps.modules.define('YmapsCircleVertex', [
  'Circle'       
],
function(provide, Circle) {

  class YmapsCircleVertex extends Circle {
    constructor(point, radius) {
      super([point, radius]);
      this.options.set("fillColor", "#0000FF");
      this.options.set("strokeColor", "#0000FF"); 
    }
  } 
  provide(YmapsCircleVertex);  
});      
      