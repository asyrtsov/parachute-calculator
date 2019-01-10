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

    constructor() {      
      var arrowStartSize = 25;
      // radius of start active area for Arrow
      var arrowStartRadius = Constant.isMobile ? arrowStartSize : arrowStartSize/2; 
      
      super(
        //map.getCenter(),
        [],        
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
      
      this.heightPlacemarkShift = 0.0001;
      
      //var point = this.geometry.getCoordinates();
      
      // Placemark for Height of Chute at this vertex
      this.heightPlacemark = new ymaps.Placemark(
        //[point[0] + this.heightPlacemarkShift, point[1]],
        [],         
        {}, 
        {
          preset: 'islands#blackStretchyIcon', 
          cursor: 'arrow'
        }
      );
            
      // when we drag arrow, we should drag its heightPlacemark too
      this.events.add('drag', function(e) {
        e.stopPropagation();
        var newPoint = this.geometry.getCoordinates();       
        this.heightPlacemark.geometry.setCoordinates(
          [newPoint[0] + this.heightPlacemarkShift, newPoint[1]]
        );          
      }.bind(this)); 

      this.boundChange = this.boundChange.bind(this);

      //this.map = null;
      
    }
    
    
    setCoordinates(coordinates) {
      this.geometry.setCoordinates(coordinates);
      this.heightPlacemark.geometry.setCoordinates(
        [coordinates[0] + this.heightPlacemarkShift, coordinates[1]]
      );      
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
    
    
    addToMap(map, coordinates = null) {
      this.map = map;
      map.geoObjects.add(this);
      map.geoObjects.add(this.heightPlacemark);
      
      if (coordinates == null) {
        coordinates = map.getCenter();
      }

      this.setCoordinates(coordinates);
      
      this.setArrowToBeScaled(true);      
    }
    
    removeFromMap(map) {
      map.geoObjects.remove(this);
      map.geoObjects.remove(this.heightPlacemark);             
    }
        
    /**
     * Set arrow to be scaled with map zooming or 
     * not to be scaled. Map should be defined. 
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
     * Event function for boundChange event from 
     * this.setArrowToBeScaled function.
     * @param {Event} e     
     */
    boundChange(e) {
      var newZoom = e.get('newZoom'),
            oldZoom = e.get('oldZoom');
      if (newZoom != oldZoom) {
        this.changeSize(newZoom);
      }
    }
    
    /**
     * @param {string} str - This will be printed in this.heightPlacemark
     */    
    print(str) {
      this.heightPlacemark.properties.set("iconContent", str);           
    }
    
  }

  provide(Arrow);  
});