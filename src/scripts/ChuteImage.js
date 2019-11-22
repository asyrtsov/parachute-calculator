ymaps.modules.define('ChuteImage', [
  'Placemark',
  'templateLayoutFactory', 
  'Constant'  
],
function(provide, Placemark, templateLayoutFactory, Constant) {
  
  /**
   * Chute Image (Yandex Maps API Placemark). 
   * You can: rotate it, change its size and coordinates.
   */
  class ChuteImage extends Placemark {

    constructor(coordinates) {      

      var chuteStartSize = 25;
      // radius of start active area for Arrow
      var chuteStartRadius = Constant.isMobile ? chuteStartSize : chuteStartSize/2; 
      
      super([], {
          chuteClass: 'chute',  
          rotation: 0,           
          size: chuteStartSize
        }, {
          draggable: true,
          iconLayout: templateLayoutFactory.createClass(
              '<div class="$[properties.chuteClass]" style="transform: rotate($[properties.rotation]deg);' + 
              'width: $[properties.size]px; height: $[properties.size]px;"/>'
            ), 
          iconShape: {
            type: 'Circle',
            coordinates: [chuteStartSize/2, chuteStartSize/2],
            radius: chuteStartRadius
          }          
        }
      );

      this.chuteStartSize = chuteStartSize;
      this.chuteStartRadius = chuteStartRadius;   

      this.setCoordinates(coordinates);
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
  }
  provide(ChuteImage);  
});