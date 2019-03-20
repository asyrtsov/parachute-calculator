ymaps.modules.define('WindVertex', [
  'Circle', 
  'Placemark'  
],
function(provide, Circle, Placemark) {
  /**
   * Point on Path which corresponding to Wind.
   */
  class WindVertex extends Circle {
    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {number} radius   
     */
    constructor(wind, map) {
      
      var point = wind.pathPoint;
      var radius = 4;
      
      super([
        point, 
        radius
      ], {}, {}); 
            
      this.options.set("fillColor", "#00FF00");
      this.options.set("strokeColor", "#00FF00");      
      
      this.map = map;
      this.wind = wind;
                  
      // Distance from vertex to it's heightPlacemark
      this.heightPlacemarkShift = 0.0001;
      
      // Placemark for Height of Chute at this vertex
      this.heightPlacemark = new ymaps.Placemark(
        [point[0] + this.heightPlacemarkShift, point[1]], 
        {}, 
        {
          preset: 'islands#darkGreenStretchyIcon', 
          cursor: 'arrow'
        }
      );
      
      this.printPlacemark(wind.getHeight() + " м");  
            
      this.clickNumber = 0;
      this.placemarkIsShown = true;
                   
      this.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick();
      }.bind(this));
      
      // remove standart map zoom for double click
      this.events.add('dblclick', function(e) {
        e.stopPropagation();  
      });          
    }
          
    /**
     * Process both click and dblclick on this vertex.
     */       
    processVertexClick() {
 
    }
   
    /**
     * @param {string} str - This will be printed in this.heightPlacemark
     */    
    printPlacemark(str) {
      this.heightPlacemark.properties.set("iconContent", str);           
    }
    
    printHint(str) {
      this.properties.set("hintContent", str);      
    }
        
    addToMap() {
      this.map.geoObjects.add(this);
      this.map.geoObjects.add(this.heightPlacemark);         
    }
    
    removeFromMap() {
      this.map.geoObjects.remove(this);
      this.map.geoObjects.remove(this.heightPlacemark);        
    }
    
    refreshCoordinates() {
      var point = this.wind.pathPoint;
      this.geometry.setCoordinates(point);
      this.heightPlacemark.geometry.setCoordinates(
      [point[0] + this.heightPlacemarkShift, point[1]]);      
    }            
  } 
  provide(WindVertex);  
}); 