ymaps.modules.define('Arrow', [
    'Placemark',
    'templateLayoutFactory'        
],
function(provide, Placemark, templateLayoutFactory) {

  class Arrow extends Placemark {
    // Yandex Maps Placemark for Wind Arrow
    // CSS for Arrow see in landing.css
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
   
    rotate(angle) {
      this.properties.set('rotation', (-1)*angle + 90);      
    }
    
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