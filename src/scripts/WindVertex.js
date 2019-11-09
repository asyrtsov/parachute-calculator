ymaps.modules.define('WindVertex', [
  'Circle', 
  'Placemark', 
  'templateLayoutFactory'  
],
function(provide, Circle, Placemark, templateLayoutFactory) {
  /**
   * Wind Vertex consists of Vertex Image (Circle) and 
   * Vertex Placemark for output. 
   */
  class WindVertex {  
    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {number} radius   
     */
    constructor(wind, map, radius = 4) {
      
      var point = wind.pathPoint;
      var color = "#0000FF";
      var strokeColor = "#00FF00";

      this.image = new ymaps.Circle([point, radius], {}, {
        fillColor: color,
        strokeColor: strokeColor, 
        strokeWidth: 2
      }); 
          
      this.map = map;
      this.wind = wind;
      this.radius = radius;

      var MyIconLayout = ymaps.templateLayoutFactory.createClass(   
        '<div class="px-2 py-1 bg-success text-center rounded border d-inline-block"' + 
              'style="font-size: 11px; font-family: Arial, Verdana, sans-serif;">' + 
          '$[properties.iconContent]' + 
        '</div>'
      ); 

      // Placemark for Height of Chute at this vertex
      this.heightPlacemark = new ymaps.Placemark(
        [point[0], point[1]], 
        {}, 
        {
          iconLayout: MyIconLayout,
          iconOffset: [0, -35], 
          cursor: 'arrow'
        }
      );

      this.placemarkIsVisible = true;      
      this.printPlacemark(wind.getHeight() + "&nbsp;м");  
            
      this.clickNumber = 0;
      this.placemarkIsShown = true;
      
      this.image.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick();
      }.bind(this));
      
      // remove standart map zoom for double click
      this.image.events.add('dblclick', function(e) {
        e.stopPropagation();  
      });          
    }

    
    getCoordinates() {
      return this.image.geometry.getCoordinates();
    }


    scale(scale) {
      var radius = this.image.geometry.getRadius();  
      radius = radius * scale;
      this.image.geometry.setRadius(radius);
    }

          
    processVertexClick() {
      this.placemarkIsVisible = !this.placemarkIsVisible;
      this.heightPlacemark.options.set('visible', this.placemarkIsVisible);
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
      this.map.geoObjects.add(this.image);
      this.map.geoObjects.add(this.heightPlacemark);         
    }
    
    removeFromMap() {
      this.map.geoObjects.remove(this.image);
      this.map.geoObjects.remove(this.heightPlacemark);        
    }
    
    refreshCoordinates() {
      var point = this.wind.pathPoint;
      this.image.geometry.setCoordinates(point);
      this.heightPlacemark.geometry.setCoordinates([point[0], point[1]]);
      this.printPlacemark(this.wind.getHeight() + "&nbsp;м");      
    }            
  } 
  provide(WindVertex);  
}); 