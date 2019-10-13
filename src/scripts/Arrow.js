ymaps.modules.define('Arrow', [
  'Placemark',
  'templateLayoutFactory', 
  'Constant'  
],
function(provide, Placemark, templateLayoutFactory, Constant) {
  
  /**
   * Wind Arrow (Yandex Maps API Placemark). 
   * With Output Placemark (icon above Arrow, where you can print yout text).
   * Arrow can be rotated, dragged and scaled.
   * Arrow can be selected or not. 
   * Selected Arrow has red-yellow colors, not-selected Arrow has red-white colors.
   * 
   * @param {boolean} placemarkIsOn - It determines if Output Placemark will be added to Map 
   * (after this.addToMap() function execution).
   * @param {boolean} isSelected - It determines if Arrow will be selected or not 
   * (it can be changed lately).
   * @param {boolean} isScaled - It determines if Arrow will be scaled when Map will be scaled 
   * (after adding Arrow to Map).
   */
  class Arrow extends Placemark {

    constructor(placemarkIsOn = false, isSelected = false, isScaled = true) {      

      var arrowStartSize = 25;
      // radius of start active area for Arrow
      var arrowStartRadius = Constant.isMobile ? arrowStartSize : arrowStartSize/2; 
      
      super(
        //map.getCenter(),
        [],        
        {
          arrowClass: isSelected? 'arrow_selected' : 'arrow',  
          rotation: 0,           
          size: arrowStartSize
        }, 
        {
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

      this.placemarkIsOn = placemarkIsOn;    
      this.isSelected = isSelected;
      // this.isScaled will be constant.
      this.isScaled = isScaled;
      // this.map will be defined, when Arrow will be added to Map 
      // (in addToMap() function)
      this.map = null;


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
          preset: 'islands#darkOrangeStretchyIcon', 
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
       
    }
    
    setCoordinates(coordinates) {
      this.geometry.setCoordinates(coordinates);
      this.heightPlacemark.geometry.setCoordinates(
        [coordinates[0] + this.heightPlacemarkShift, coordinates[1]]
      );      
    }
   
   /**
    * Change arrow selection
    * @param {(boolean | null)} - isSelected    
    */   
    setSelection(isSelected = null) {

      this.isSelected = (isSelected == null) ? 
        !this.isSelected : isSelected; 
      
      var arrowClass = this.isSelected ? 'arrow_selected' : 'arrow';      
      this.properties.set('arrowClass', arrowClass);   
    }

    getSelection() {
      return(this.isSelected);
    }    
                 
   /**
    * Rotate arrow
    */
    rotate(angle) {
      this.properties.set('rotation', (-1)*angle);      
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
    
    /**
     * Before calling this funcion, this.map = null
     */
    addToMap(map, coordinates = null) {
      this.map = map;
      map.geoObjects.add(this);
      
      if (this.placemarkIsOn) {
        map.geoObjects.add(this.heightPlacemark);
      }  
            
      // If coordinates are not given, we add Arrow to random 
      // coordines around map.getCenter()
      if (coordinates == null) {
        var e = 0.005;
        var mapCenter = map.getCenter();
        var dlatitude = 
          (Math.random() - 0.5) * e * Math.cos((Math.PI/180) * mapCenter[0]);
        var dlongtitude = (Math.random() - 0.5) * e;  
        coordinates = mapCenter;
        coordinates[0] += dlatitude;
        coordinates[1] += dlongtitude;
      }

      this.setCoordinates(coordinates);


      if (this.isScaled) {
        this.map.events.add('boundschange', this.boundChange);
        var zoom = this.map.getZoom();
        this.changeSize(zoom);           
      }

      
      //this.setArrowToBeScaled(true);      
    }
    
    /**
     * It is supposed that this.map has already been 
     * defined during addToMap() function execution. 
     */
    removeFromMap() {
      this.map.geoObjects.remove(this);

      if (this.placemarkIsOn) {
        this.map.geoObjects.remove(this.heightPlacemark);
      }

      if (this.isScaled) {
        this.map.events.remove('boundschange', this.boundChange); 
        this.changeSize(Constant.defaultZoom);       
      }      

      this.map = null;         
    }
        
    addPlacemark() {
      if (!this.placemarkIsOn) {
        this.placemarkIsOn = true;
        if (this.map != null) {
          this.map.geoObjects.add(this.heightPlacemark);
        }  
      }      
    } 
        
    removePlacemark() {
      if (this.placemarkIsOn) {
        this.placemarkIsOn = false;
        if (this.map != null) {
          this.map.geoObjects.remove(this.heightPlacemark);
        }
      }         
    } 
      
    /**
     * Set arrow to be scaled with map zooming or 
     * not to be scaled. Map should be defined. 
     * @param {boolean} arrowIsScaled
     */   
    /*  
    setArrowToBeScaled(arrowIsScaled) {
      
      this.isScaled = arrowIsScaled;
    
      if (arrowIsScaled) {
        this.map.events.add('boundschange', this.boundChange);
        var zoom = this.map.getZoom();
        this.changeSize(zoom);
                
      } else {
        this.map.events.remove('boundschange', this.boundChange); 
        this.changeSize(Constant.defaultZoom);       
      }       
    }   
    
    getIsScaled() {
      return(this.isScaled);
    }   */
    
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
     * Note: this.placemarkIsOn should be equal true to 
     * see print result on the map. 
     * @param {string} str - This will be printed in this.heightPlacemark
     */    
    print(str) {
      this.heightPlacemark.properties.set("iconContent", str);           
    }
    
  }

  provide(Arrow);  
});