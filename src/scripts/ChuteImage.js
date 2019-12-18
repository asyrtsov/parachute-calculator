ymaps.modules.define('ChuteImage', [
  'Placemark',
  'templateLayoutFactory', 
  'Constant'  
],
function(provide, Placemark, templateLayoutFactory, Constant) {
  
  /**
   * Chute Image (Yandex Maps API Placemark). 
   * You can: rotate it and change its coordinates.
   */
  class ChuteImage extends Placemark {

    /**
     * @param {null | Number[]} coordinates 
     */
    constructor(coordinates = null) {      
      var chuteStartSize = 25;
      // radius of start active area for Arrow
      var chuteStartRadius = Constant.isMobile ? chuteStartSize : chuteStartSize/2; 
      
      super(coordinates, {
            chuteClass: 'chute',  
            rotation: 0,           
            size: chuteStartSize
          }, {
            iconLayout: templateLayoutFactory.createClass(
                '<div class="$[properties.chuteClass]" style="transform: rotate($[properties.rotation]deg);' + 
                'width: $[properties.size]px; height: $[properties.size]px;"/>'), 
            iconOffset: [-12, -12],
            iconShape: {
              type: 'Circle',
              coordinates: [chuteStartSize/2, chuteStartSize/2],
              radius: chuteStartRadius
            }          
          });  
    }
    
    /**
     * @param {null | Number[]} coordinates 
     */
    setCoordinates(coordinates) {
      this.geometry.setCoordinates(coordinates); 
    }

   /**
    * Rotate arrow
    * @param {Number} angle
    */
    rotate(angle) {
      this.properties.set('rotation', (-1)*angle);      
    }
  }
  provide(ChuteImage);  
});