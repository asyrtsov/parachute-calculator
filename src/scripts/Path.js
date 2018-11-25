/** @module Path */      
ymaps.modules.define('Path', [
  'Circle', 
  'Polyline', 
  'YmapsCircleVertex', 
  'YmapsTriangleVertex'  
],
function(provide, Circle, Polyline, YmapsCircleVertex, YmapsTriangleVertex) {     
  /**
   * List of vertices and lines of Chute Path.
   * Last vertex consist of one outer Circle (ymaps.Circle) and 
   * arrow (YmapsTriangleVertex object that extends ymaps.Polyline).
   * Other vertices consist of one outer Circle (ymaps.Circle) and 
   * one inner Circle (ymaps.Circle). 
   * Outer vertex circles are invisible and serve for handy pressing 
   * vertex in Mobile case.
   */  
  class Path {
    /**
     * @param {Map} map - Yandex map.
     * @param {boolean} isMobile   
     */  
    constructor(map, isMobile) {
      this.map = map;
      this.firstVertex = null;
      this.lastVertex = null;
      // number of vertices
      this.length = 0;

      // radius for inner circle vertices, in meters
      this.vertexRadius = 7;
      // radius for outer invisible circles, in meters    
      this.vertexOuterRadius = isMobile ? this.vertexRadius*4 : this.vertexRadius;     
       
      this.addVertex = this.addVertex.bind(this);
      this.removeVertex = this.removeVertex.bind(this);
      this.clear = this.clear.bind(this);    
    }
    
    /**
     * Add new vertex to Path and to map.
     * Add corresponding line segment to Path and to map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Circle} lastVertex
     */
    addVertex(point) {  

      var map = this.map;
      
      var currentVertex = new ymaps.Circle([
        point, 
        this.vertexOuterRadius
      ], {}, {
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0
      });  
              
      if (this.length > 0) {
        var lastPoint = this.lastVertex.geometry.getCoordinates();
        
        currentVertex.image = new YmapsTriangleVertex(lastPoint, point);
      
        // We remove previous last circle. Add next line. 
        // Add previuos last circle. Add last circle.
        // The reason: lines should be UNDER circles        
        map.geoObjects.remove(this.lastVertex);
        map.geoObjects.remove(this.lastVertex.image);        
       
        // We change last Triengle vertex to Circle vertex 
        this.lastVertex.image = new YmapsCircleVertex(lastPoint, this.vertexRadius);
  
        this.lastVertex.nextLine = new ymaps.Polyline([lastPoint, point]);
        this.lastVertex.nextVertex = currentVertex;
        
        map.geoObjects.add(this.lastVertex.nextLine);   
        map.geoObjects.add(this.lastVertex.image);
        map.geoObjects.add(this.lastVertex);

        currentVertex.prevVertex = this.lastVertex;
      } else {  // this.length = 0;
        currentVertex.image = new YmapsCircleVertex(point, this.vertexRadius);        
        this.firstVertex = currentVertex;
      }

      map.geoObjects.add(currentVertex.image);
      map.geoObjects.add(currentVertex);
      
      this.lastVertex = currentVertex;        
      this.length++; 

      return(this.lastVertex);       
    }

    /**
     * Remove vertex from Path and from map.
     * @param {Circle} removingVertex
     */    
    removeVertex(removingVertex) {
      var map = this.map;
    
      map.geoObjects.remove(removingVertex);
      map.geoObjects.remove(removingVertex.image);
      
      var prevVertex = removingVertex.prevVertex;
      var nextVertex = removingVertex.nextVertex;
      
      if (this.length > 1) {
        if ((prevVertex != undefined) && (nextVertex != undefined)) {
          
          var removingLine1 = prevVertex.nextLine;
          var removingLine2 = removingVertex.nextLine;
          
          map.geoObjects.remove(removingLine1);
          map.geoObjects.remove(removingLine2);
          
          var prevPoint = prevVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();
          
          map.geoObjects.remove(prevVertex);  // lines should be UNDER circles
          map.geoObjects.remove(prevVertex.image);
          map.geoObjects.remove(nextVertex);
          map.geoObjects.remove(nextVertex.image);
          
          var currentLine = new ymaps.Polyline([prevPoint, nextPoint]);
          this.map.geoObjects.add(currentLine);
          
          prevVertex.nextLine = currentLine;
          prevVertex.nextVertex = nextVertex;
          nextVertex.prevVertex = prevVertex;
          
          map.geoObjects.add(prevVertex.image);
          map.geoObjects.add(prevVertex); 

          // case when nextVertex is lastVertex 
          // and so we have to change direction of 
          // arrow (triangle) of lastVertex
          if (nextVertex.nextVertex == undefined) {             
            nextVertex.image = new YmapsTriangleVertex(prevPoint, nextPoint);     
          }         
          map.geoObjects.add(nextVertex.image);
          map.geoObjects.add(nextVertex);
        } else if (nextVertex == undefined) {  // last circle case   
          var removingLine = prevVertex.nextLine;
          map.geoObjects.remove(removingLine);
          this.lastVertex = prevVertex;
          prevVertex.nextVertex = null;
          prevVertex.nextLine = null; 
          if (prevVertex.prevVertex != undefined) {
            map.geoObjects.remove(prevVertex.image);
            map.geoObjects.remove(prevVertex);
            var prevPrevPoint = prevVertex.prevVertex.geometry.getCoordinates();
            var prevPoint = prevVertex.geometry.getCoordinates();            
            prevVertex.image = new YmapsTriangleVertex(prevPrevPoint, prevPoint);
            map.geoObjects.add(prevVertex.image);
            map.geoObjects.add(prevVertex);            
          }          
        } else {  // first circle case
          map.geoObjects.remove(removingVertex.nextLine); 
          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;           
          
          if (this.length == 2) {
            var p = nextVertex.geometry.getCoordinates();
            map.geoObjects.remove(nextVertex);
            map.geoObjects.remove(nextVertex.image);
            nextVertex.image = new YmapsCircleVertex(p, this.vertexRadius);
            map.geoObjects.add(nextVertex.image);
            map.geoObjects.add(nextVertex);
          }            
        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }
      
      this.length--;
    }
    
    /** Remove all vetrices and line segments from Path and from map. */    
    clear() {
      var map = this.map;
           
      if (this.length == 0 ) return;
      
      var currentVertex = this.lastVertex;  
      map.geoObjects.remove(currentVertex);
      map.geoObjects.remove(currentVertex.image);
      
      for(var i=1; i < this.length; i++) {
        currentVertex = currentVertex.prevVertex; 
        map.geoObjects.remove(currentVertex);
        map.geoObjects.remove(currentVertex.image);
        map.geoObjects.remove(currentVertex.nextLine);
      }
      
      this.length = 0;
      this.lastVertex = null;  
    }

    /**
     * Print heights in vertices hints.
     * @param {number[]} height - heights in Path vertices.
     */     
    printHeightHints(height) {
      if (this.length > 0) {      
        var currentVertex = this.firstVertex;      
        for(var i=0; i<height.length; i++) {
          currentVertex.properties.set("hintContent", "h=" + 
                                       Math.floor(height[i]) + "м");        
          currentVertex = currentVertex.nextVertex;
        }
        for(var i=height.length; i<this.length; i++) {
          currentVertex.properties.set("hintContent", "Невозможно!");        
          currentVertex = currentVertex.nextVertex;                    
        }
      }      
    }   
  }
  
  provide(Path);      
});      
