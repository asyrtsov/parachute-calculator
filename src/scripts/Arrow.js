/** @module Arrow */
ymaps.modules.define('Arrow', [
  'Placemark',
  'templateLayoutFactory', 
  'Constant'  
],
function(provide, Placemark, templateLayoutFactory, Constant) {
  
  /**
   * Yandex Maps Placemark for Arrow (Windsock). 
   */
  class Arrow extends Placemark {

    constructor(map, isMobile) {      
      var arrowStartSize = 25;
      // radius of start active area for Arrow
      var arrowStartRadius = isMobile ? arrowStartSize : arrowStartSize/2; 
        
      super(
        map.getCenter(), 
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

      this.map = map;
      
      this.boundChange = function(e) {
        var newZoom = e.get('newZoom'),
              oldZoom = e.get('oldZoom');
        if (newZoom != oldZoom) {
          this.changeSize(newZoom);
        }
      }.bind(this); 

      this.setArrowToBeScaled(true);          
    }
    
    /**
     * Set arrow to be scaled with map zooming or 
     * not to be scaled
     * @param {boolean} arrowIsScaled
     */     
    setArrowToBeScaled(arrowIsScaled) {
    
      if (arrowIsScaled) {
        this.map.events.add('boundschange', this.boundChange);
        var zoom = this.map.getZoom();
        this.changeSize(zoom);
                
      } else {
        this.map.events.remove('boundschange', this.boundChange); 
        this.changeSize(Constant.defaultZoom);       
      }       
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
      var size = (2**(newZoom - Constant.defaultZoom))*(this.arrowStartSize);
      
      var shape = 
        {
          type: 'Circle',
          coordinates: [size/2, size/2],
          radius: (2**(newZoom - Constant.defaultZoom))*(this.arrowStartRadius)
        };
      
      this.options.set('iconShape', shape);      
      this.properties.set('size', size);
      // properties.set call rebuild of Placemark, 
      // so, properties.set should stay after options.set      
    }    
  }

  provide(Arrow);  
});