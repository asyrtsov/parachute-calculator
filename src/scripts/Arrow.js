ymaps.modules.define('Arrow', [
  'Placemark',
  'templateLayoutFactory', 
  'Constant'  
],
function(provide, Placemark, templateLayoutFactory, Constant) {
  
  /**
   * Wind Arrow (Yandex Maps API Placemark). 
   * You can: rotate it, change its size and coordinates.
   */
  class Arrow extends Placemark {

    constructor(coordinates = null) {      

      var arrowStartSize = 25;
      // radius of start active area for Arrow
      var arrowStartRadius = Constant.isMobile ? arrowStartSize : arrowStartSize/2; 
      
      super([], {
          arrowClass: 'arrow',  
          rotation: 0,           
          size: arrowStartSize
        }, {
          draggable: true,
          iconLayout: templateLayoutFactory.createClass(
              '<div class="$[properties.arrowClass]" style="transform: rotate($[properties.rotation]deg);' + 
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

      if (coordinates != null) {
        this.setCoordinates(coordinates);
      }
      
      this.boundChange = this.boundChange.bind(this);
       
    }
    
    setCoordinates(coordinates) {
      this.geometry.setCoordinates(coordinates);   
    }

    
   /**
    * Rotate arrow
    */
    rotate(angle) {
      this.properties.set('rotation', (-1)*angle);      
    }

    
    /**
     * Arrow can have different size for different Zoom.
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

    
    /**
     * If Yandex Maps Zoom is changed we will call this.changeSize() function.
     * @param {Event} e - Yandex Maps 'boundschange' event.     
     */
    boundChange(e) {
      var newZoom = e.get('newZoom'),
            oldZoom = e.get('oldZoom');
      if (newZoom != oldZoom) {
        this.changeSize(newZoom);
      }
    }        
  }

  provide(Arrow);  
});