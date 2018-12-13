ymaps.modules.define('Vertex', [
  'Circle', 
  'Placemark'  
],
function(provide, Circle, Placemark) {
  /**
   * Vertex of Path. 
   * It is invisible circle. Vertex image will be vertex.image object.
   */
  class Vertex extends Circle {
    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {number} radius
     * @param {Path} path - Link to path; we need it because 
     * double clicking and draging of vertex change path (neibours of vertex).     
     */
    constructor(point, radius, path) {
      super([
        point, 
        radius
      ], {}, {
        draggable: true,
        // vertex will be invisible
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0, 
        zIndex: path.vertexZIndex
      }); 
            
      // Distance from vertex to it's heightPlacemark
      this.heightPlacemarkShift = 0.0002;
      
      // Placemark for Height of Chute at this vertex
      this.heightPlacemark = new ymaps.Placemark(
        [point[0] + this.heightPlacemarkShift, point[1]], 
        {}, 
        {
          preset: 'islands#blackStretchyIcon', 
          cursor: 'arrow'
        }
      );
      
      // This varialable will be set up later.
      this.image = null;
      
      this.path = path;      
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
      
      this.events.add('drag', function(e) {
        e.stopPropagation();
        this.processVertexDrag();       
      }.bind(this));
    
    }
          
    /**
     * Process both click and dblclick on this vertex.
     */       
    processVertexClick() {
      this.clickNumber++;
      if (this.clickNumber == 1) {
        setTimeout(function() {        
          if (this.clickNumber == 1) {  // Single Click
            this.placemarkIsShown = !this.placemarkIsShown;
            
            if (this.placemarkIsShown) {
              this.path.map.geoObjects.add(this.heightPlacemark);
            } else {
              this.path.map.geoObjects.remove(this.heightPlacemark);                  
            }
                            
            this.clickNumber = 0;
          } else {  // Double Click               
            this.path.removeVertex(this);                 
          }  
        }.bind(this), 200);
      }  
    };

    /**
     * Process vertex dragging.
     */     
    processVertexDrag() {
      var newPoint = this.geometry.getCoordinates();
     
      this.heightPlacemark.geometry.setCoordinates(
        [newPoint[0] + this.heightPlacemarkShift, newPoint[1]]
      );
      
      this.path.dragVertex(this);         
    }  
  } 
  provide(Vertex);  
}); 