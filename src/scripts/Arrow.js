/** @module Arrow */
ymaps.modules.define('Arrow', [
  'Placemark',
  'templateLayoutFactory'        
],
function(provide, Placemark, templateLayoutFactory) {
  
  /**
   * Yandex Maps Placemark for Arrow (Windsock). 
   */
  class Arrow extends Placemark {

    constructor(center, isMobile) {      
      var arrowStartSize = 25;
      // radius of start active area for Arrow
      var arrowStartRadius = isMobile ? arrowStartSize : arrowStartSize/2; 
        
      super(
        center, 
        {
          rotation: 90, 
          size: arrowStartSize
        }, 
        {
          draggable: true,
          iconLayout: templateLayoutFactory.createClass(
              '<div class="arrow" style="transform: rotate($[properties.rotation]deg);' + 
              'width: $[properties.size]px; height: $[properties.size]px;"/>'
            ), 
          iconShape: {
            type: 'Circle',
            coordinates: [arrowStartSize/2, arrowStartSize/2],
            radius: arrowStartRadius
          }  
        }
      );

      this.arrowStartSize = arrowStartSize;
      this.arrowStartRadius = arrowStartRadius;    
    }
   
   /**
    * Rotate arrow
    */
    rotate(angle) {
      this.properties.set('rotation', (-1)*angle + 90);      
    }
    
    /**
     * Arrow will have different size for different Zoom.
     */
    changeSize(newZoom) {
      var size = (2**(newZoom - 16))*(this.arrowStartSize);
      
      var shape = 
        {
          type: 'Circle',
          coordinates: [size/2, size/2],
          radius: (2**(newZoom - 16))*(this.arrowStartRadius)
        };
      
      this.options.set('iconShape', shape);      
      this.properties.set('size', size);
      // properties.set call rebuild of Placemark, 
      // so, properties.set should stay after options.set      
    }    
  }

  provide(Arrow);  
});