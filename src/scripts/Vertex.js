ymaps.modules.define('Vertex', [
  'Circle',
  'CircleVertex',
  'TriangleVertex', 
  'Placemark',   
  'templateLayoutFactory'
],
function(provide, Circle, CircleVertex, TriangleVertex,   Placemark, templateLayoutFactory) {
  /**
   * Vertex of Path. 
   * Vertex consists of: Invisible Event Circle (it is used for catching 
   * events for Vertex), Vertex Placemark for Output, Vertex Image (Circle or Triangle).
   * Also it contains references to previous and next Vertices. 
   */
  class Vertex {    
    /**
     * @param {number[]} point - Yandex.Maps coordinates of center.
     * @param {number} eventRadius - Radius of Event Circle.
     * @param {Path} path - Link to parent Path; we need it because some vertex
     * operations (like clicking on Placemark Cross = Path clear) change the Path.   
     */
    constructor(point, eventRadius, path) {

      // Event Circle
      this.eventCircle = new ymaps.Circle(
        [point, eventRadius], 
        {}, 
        {
          draggable: true,
          // vertex will be invisible
          fillOpacity: 0,
          strokeOpacity: 0, 
          strokeWidth: 0, 
          zIndex: 2
        }
      );

            
      // Output Placemark
      this.heightPlacemark = new ymaps.Placemark(
        [point[0], point[1]], 
        {iconContent: ''}, 
        {
          iconOffset: [-50, -35],
          cursor: 'arrow'
        }
      );

      this.placemarkHintContent = null;
      this.placemarkIsVisible = true;
      
      // Image of Vertex. 
      // To set it, use this.setTriangleImage() or this.setCircleImage()
      // You should not add Vertex to Map until Image is not set up.
      this.image = null;
      this.imageZIndex = 1;      
      
      // null - for undefined, true - for Triangle Vertex Image, false - for Circle Vertex Image.
      this.isTriangleVertex = null;

      this.path = path; 

      // References to some another Vertices.
      this.prevVertex = null;
      this.nextVertex = null;

      this.prevEdge = null;
      this.nextEdge = null;
      
      this.clickNumber = 0;

      this.vertexIsOnMap = false;
      // Vertex single clicking switcher
      this.singleClickingIsOn = true;
     
      // Turning on/off vertex when conditon 
      // "reachable/unreachable" was changed
      this.wasTurnOffBecauseUnreachable = false;
      // The same for back direction
      this.wasTurnOffBecauseBackUnreachable = false;

      // Chute height at this vertex. It will be calculated later.      
      this.height = null;      
              
      this.eventCircle.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processVertexClick();
      }.bind(this));
      
      // remove standart map zoom for double click
      this.eventCircle.events.add('dblclick', function(e) {
        e.stopPropagation();  
      });
      
      this.eventCircle.events.add('drag', function(e) {
        e.stopPropagation();
        var point = this.eventCircle.geometry.getCoordinates();
        this.setCoordinates(point);       
      }.bind(this));
    
    }


    /**
     * @param {Vertex | null} vertex 
     */
    setNextVertex(vertex) {
      this.nextVertex = vertex;
      if (vertex != null) {        
        vertex.prevVertex = this;
      } 
    }

    setPrevVertex(vertex) {
      this.prevVertex = vertex;
      if (vertex != null) {        
        vertex.nextVertex = this;
      } 
    }


    setNextEdge(edge) {
      this.nextEdge = edge;
      if (edge != null) {        
        edge.prevVertex = this;
        edge.nextVertex = this.nextVertex;
        if (this.nextVertex != null) {
          this.nextVertex.prevEdge = edge;
        }
      } 
    }

    setPrevEdge(edge) {
      this.prevEdge = edge;
      if (edge != null) {
        edge.nextVertex = this;
        edge.prevVertex = this.prevVertex;
        if (this.prevVertex != null) {
          this.prevVertex.nextEdge = edge;
        }
      }
    }


    /**
     * @param {number[]} prevPoint - Previuos point that define direction of Triangle.
     */
    setTriangleVertex(prevPoint) {

      this.isTriangleVertex = true;

      if (this.vertexIsOnMap) {
        this.path.map.geoObjects.remove(this.image);
        this.path.map.geoObjects.remove(this.heightPlacemark);  
      }

      var point1 = prevPoint;
      var point2 = this.getCoordinates();
      
      // Set Triangle Image 
      this.image = new TriangleVertex(point1, point2, this.imageZIndex);

      // Set Placemark with Closing Cross
      var path = this.path;
      var MyIconLayout = ymaps.templateLayoutFactory.createClass(   
        '<div class="container" style="padding: 0; width: 96px;' + 
              'font-size: 11px; font-family: Arial, Verdana, sans-serif;">' +
          '<div class="d-flex text-center">' +
            '<div class="p-1 flex-grow-1 bg-info">$[properties.iconContent]</div>' +            
            '<div class="p-1 bg-warning hoverColor">&#10006;</div>' +
          '</div>' +
        '</div>', {
          build: function () {
            console.log('build');
            this.constructor.superclass.build.call(this);
            this.path = path;
            var elem = this.getData().geoObject;
            elem.events.add('click', this.clickFunc, this);
            elem.events.add('mouseenter', this.mouseEnter, this);
            elem.events.add('mouseleave', this.mouseLeave, this);
          }, 

          clear: function () {
            console.log('clear');
            //console.log(this.getData().geoObject.events);
            //this.getData().geoObject.events.group().removeAll()

            var elem = this.getData().geoObject;
            elem.events.remove('click', this.clickFunc, this);
            elem.events.remove('mouseenter', this.mouseEnter, this);
            elem.events.remove('mouseleave', this.mouseLeave, this);

            //console.log(this.getData().geoObject.events);
            this.constructor.superclass.clear.call(this);
          },
          
          clickFunc: function(e) {
            e.preventDefault();
            if (this.path.length > 2) { 
              if (confirm("Удалить все метки? \n\n (для удаления только одной метки дважды щелкните по ней)")) {
                this.path.clear();
              };
            } else {
              this.path.clear();
            }
          }.bind(this),
          
          mouseEnter: function() {
            console.log('mouseenter');
            var elem = this.getParentElement().getElementsByClassName('hoverColor')[0];
            elem.style.color = "red";
          },

          mouseLeave: function() {
            console.log('mouseleave');
            var elem = this.getParentElement().getElementsByClassName('hoverColor')[0];
            elem.style.color = "green";
          }           
        }
      );

      var MyIconShape = {
        type: 'Rectangle',
        coordinates: [[71, 0], [96, 25]]
      };
           
      this.heightPlacemark.options.set('iconLayout', MyIconLayout);
      this.heightPlacemark.options.set('iconShape', MyIconShape);

      if (this.vertexIsOnMap) {
        this.path.map.geoObjects.add(this.image);
        this.path.map.geoObjects.add(this.heightPlacemark);  
      }     
    }

    /**
     * @param {number} radius - Radious of Vertex Image.
     */
    setCircleVertex(radius) {

      this.isTriangleVertex = false;

      if (this.vertexIsOnMap) {
        this.path.map.geoObjects.remove(this.image);
        this.path.map.geoObjects.remove(this.heightPlacemark);  
      }

      var point = this.getCoordinates();

      // Set Circle Image
      this.image = new CircleVertex(point, radius, this.imageZIndex);
      
      // Set Placemark without Closing Cross
      var MyIconLayout = ymaps.templateLayoutFactory.createClass(   
        '<div class="container" style="padding: 0; width: 96px;' + 
              'font-size: 11px; font-family: Arial, Verdana, sans-serif;">' +
          '<div class="p-1 bg-info text-center">$[properties.iconContent]</div>' +            
        '</div>'
      );  
            
      this.heightPlacemark.options.set('iconLayout', MyIconLayout);
      this.heightPlacemark.options.set('iconShape', null);
  
      if (this.vertexIsOnMap) {
        this.path.map.geoObjects.add(this.image); 
        this.path.map.geoObjects.add(this.heightPlacemark); 
      }  
    }  
    
        
    addToMap() {
      if (!this.vertexIsOnMap && this.isTriangleVertex != null) {
        this.path.map.geoObjects.add(this.eventCircle);         
        this.path.map.geoObjects.add(this.image);
        this.path.map.geoObjects.add(this.heightPlacemark);       
        this.vertexIsOnMap = true;
      }      
    }
    
    
    removeFromMap() {
      if (this.vertexIsOnMap) {
        this.path.map.geoObjects.remove(this.eventCircle);         
        this.path.map.geoObjects.remove(this.image);
        this.path.map.geoObjects.remove(this.heightPlacemark);       
        this.vertexIsOnMap = false;
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
              if (this.nextVertex != null) {
                this.placemarkIsVisible = !this.placemarkIsVisible;
                this.heightPlacemark.options.set('visible', this.placemarkIsVisible);
                //console.log(this.heightPlacemark);
                if (this.placemarkIsVisible) {                
                  this.path.map.geoObjects.remove(this.eventCircle);                    
                  this.eventCircle.properties.set('hintContent', null);
                  this.path.map.geoObjects.add(this.eventCircle); 
                } else {
                  this.eventCircle.properties.set('hintContent', this.placemarkHintContent);
                }
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
     * Set the same coordinates for Event Circle, 
     * Vertex Placemark, Vertex Image.
     * Change Direction of Triangles (if vertex is Triangle vertex) 
     * for this Vertex, prevVertex, nextVertex. 
     */     
    setCoordinates(point) {
     
      this.eventCircle.geometry.setCoordinates(point);
      this.heightPlacemark.geometry.setCoordinates(point);
      this.image.geometry.setCoordinates(point);

      if (this.isTriangleVertex && this.prevVertex != null) {
         var prevPoint = this.prevVertex.eventCircle.geometry.getCoordinates();
         this.image.setCoordinates(prevPoint, point);
      } 
       
      if (this.nextVertex != null && this.nextVertex.isTriangleVertex) {
        var nextPoint = this.nextVertex.eventCircle.geometry.getCoordinates();
        this.nextVertex.image.setCoordinates(point, nextPoint);
      }

      this.path.dragVertex(this);         
    }


    getCoordinates() {
      return this.eventCircle.geometry.getCoordinates();
    }

    
    /**
     * @param {string} str - This will be printed in this.heightPlacemark
     */    
    printPlacemark(str) {
      this.heightPlacemark.properties.set('iconContent', str); 
    }
    
    printHint(str) {
      this.placemarkHintContent = str;

      if (!this.placemarkIsVisible) {
        this.eventCircle.properties.set('hintContent', str);
      }     
    }       
  } 
  provide(Vertex);  
}); 