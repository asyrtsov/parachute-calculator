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
      this.heightPlacemarkShift = 0.0001;
      
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

      this.prevVertex = null;
      this.nextVertex = null;
      
      this.clickNumber = 0;
      this.placemarkIsShown = false;
      this.vertexIsShown = false;
      // Vertex single clicking switcher
      this.singleClickingIsOn = true;
     
      // Turning on/off vertex when conditon 
      // "reachable/unreachable" was changed
      this.wasTurnOffBecauseUnreachable = false;
      // The same for back direction
      this.wasTurnOffBecauseBackUnreachable = false;

      // Chute height at this vertex. It will be calculated later.      
      this.height = null;      
              
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
    

    
    addToMap() {
      if (!this.vertexIsShown) {
        this.path.map.geoObjects.add(this);         
        this.path.map.geoObjects.add(this.image);       
        this.vertexIsShown = true;
      }      
    }
    
    
    removeFromMap() {
      if (this.vertexIsShown) {
        this.path.map.geoObjects.remove(this);         
        this.path.map.geoObjects.remove(this.image);       
        this.vertexIsShown = false;
      }               
    }

    
    showPlacemark() {
      if (this.path != null) {
        if (!this.placemarkIsShown) {
          this.path.map.geoObjects.add(this.heightPlacemark);
          this.placemarkIsShown = true;
        } else {
          console.warn("Placemark has already shown!");
        }
      } else {
        console.warn("this.path == null!");
      }      
    } 

    
    hidePlacemark() {
      if (this.path != null) {
        if (this.placemarkIsShown) {
          this.path.map.geoObjects.remove(this.heightPlacemark);
          this.placemarkIsShown = false;
        } else {
          console.warn("Placemark has already hiden!");
        }
      } else {
        console.warn("this.path == null!");
      }      
    }
    
    /** 
     * Turn off single clicking on vertex.
     * Remember, that single clicking on vertex 
     * shows or hides Placemark.     
     */
    turnOffSingleClicking() {
      if (this.singleClickingIsOn) {
        this.singleClickingIsOn = false;
      } else {
        console.warn("Single clicking is already off!");
      }        
    }

    /** 
     * Turn on single clicking on vertex.
     * Remember, that single clicking on vertex 
     * shows or hides Placemark.     
     */    
    turnOnSingleClicking() {
      if (!this.singleClickingIsOn) {
        this.singleClickingIsOn = true;
      } else {
        console.warn("Single clicking is already on!");
      }            
    }
         
    /**
     * Process both click and dblclick on this vertex.
     * Single clicking is for showing/hiding Placemark. 
     * Double clicking is for vertex removing.
     */       
    processVertexClick() {
      this.clickNumber++;
      if (this.clickNumber == 1) {
        setTimeout(function() {        
          if (this.clickNumber == 1) {  // Single Click (show/hide Placemark)
            if (this.singleClickingIsOn) {
              if (this.placemarkIsShown) {
                this.hidePlacemark();
              } else {
                this.showPlacemark();             
              }
            }                            
            this.clickNumber = 0;
          } else {  // Double Click (remove Vertex)               
            this.path.removeVertex(this);                 
          }  
        }.bind(this), 200);
      }  
    }

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
    
    /**
     * @param {string} str - This will be printed in this.heightPlacemark
     */    
    printPlacemark(str) {
      this.heightPlacemark.properties.set("iconContent", str);           
    }
    
    printHint(str) {
      this.properties.set("hintContent", str);      
    }       
  } 
  provide(Vertex);  
}); 