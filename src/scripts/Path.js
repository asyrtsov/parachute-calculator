/** @module Path */      
ymaps.modules.define('Path', [
  'Circle', 
  'Polyline', 
  'YmapsCircleVertex', 
  'YmapsTriangleVertex'  
],
function(provide, Circle, Polyline, YmapsCircleVertex, YmapsTriangleVertex) {     
  /**
   * List of vertices and line segments of Chute Path.
   * Line segments connect vertices.
   * Last vertex consist of one outer invisible Circle (ymaps.Circle)  
   * and arrow (YmapsTriangleVertex object that extends ymaps.Polyline).
   * Other vertices consist of one outer invisible Circle (ymaps.Circle)
   * and one visible inner Circle (ymaps.Circle). 
   * Outer vertex circles are invisible and serve for handy clicking  
   * vertices.
   */  
  class Path {
    /**
     * @param {Map} map - link to Yandex map.
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
      this.vertexOuterRadius = isMobile ? 4*this.vertexRadius : 2*this.vertexRadius;     
       
      //this.addVertex = this.addVertex.bind(this);
      //this.removeVertex = this.removeVertex.bind(this);
      //this.dragVertex = this.dragVertex.bind(this);
      //this.clear = this.clear.bind(this);          
    }
    
    /**
     * Add new vertex to Path and to map.
     * Add corresponding line segment to Path and to map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Circle} lastVertex
     */
    addVertex(point) {  

      var map = this.map;
      
      var vertex = new ymaps.Circle([
        point, 
        this.vertexOuterRadius
      ], {}, {
        draggable: true,
        // vertex will be invisible
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0
      });  
              
      if (this.length > 0) {
        var lastPoint = this.lastVertex.geometry.getCoordinates();
        
        vertex.image = new YmapsTriangleVertex(lastPoint, point);
      
        // We remove previous vertex. Add next line segment. 
        // Add previuos vertex. Add current vertex.
        // The reason: line segments should be UNDER vertices        
        map.geoObjects.remove(this.lastVertex);
        map.geoObjects.remove(this.lastVertex.image);        
       
        // We change last Triengle vertex to Circle vertex 
        this.lastVertex.image = new YmapsCircleVertex(lastPoint, this.vertexRadius);
  
        this.lastVertex.nextLine = new ymaps.Polyline([lastPoint, point]);
        this.lastVertex.nextVertex = vertex;
        
        map.geoObjects.add(this.lastVertex.nextLine);   
        map.geoObjects.add(this.lastVertex.image);
        map.geoObjects.add(this.lastVertex);
        
        console.log(this.lastVertex.image);
        console.log(this.lastVertex);
        

        vertex.prevVertex = this.lastVertex;
      } else {  // this.length = 0;
        vertex.image = new YmapsCircleVertex(point, this.vertexRadius);        
        this.firstVertex = vertex;
      }

      map.geoObjects.add(vertex.image);
      map.geoObjects.add(vertex);
      
      this.lastVertex = vertex;        
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
        } else if (nextVertex == undefined) {  // last vertex case   
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

    
    /**
     * Drag vertex with neibour line segments.
     * @param {Circle} vertex
     */     
    dragVertex(vertex) {
      var map = this.map;
      
      // new vertex coordinates
      var point = vertex.geometry.getCoordinates();

                       
      var nextVertex = vertex.nextVertex;
      var prevVertex = vertex.prevVertex;  
      
      // Case: both prevVertex and nextVertex don't exist, 
      // that is, path consists of one vertex
      if ((nextVertex == undefined) && (prevVertex == undefined)) {
        vertex.image.geometry.setCoordinates(point);
        return;
      }

      // Case: both prevVertex and nextVertex exist,
      // that is this vertex is not first and not last.     
      if ((nextVertex != undefined) && (prevVertex != undefined)) {

        vertex.image.geometry.setCoordinates(point); 
        
        var nextPoint = nextVertex.geometry.getCoordinates();
        var prevPoint = prevVertex.geometry.getCoordinates();
        
        var nextLine = vertex.nextLine;
        var prevLine = prevVertex.nextLine;
        
        nextLine.geometry.setCoordinates([point, nextPoint]);
        prevLine.geometry.setCoordinates([prevPoint, point]);        
      
        // Case when vertex.nextVertex is lastVertex:
        // in that case your should change 
        // direction of arrow at lastVertex.
        if (nextVertex.nextVertex == undefined) {        
          nextVertex.image.setCoordinates(point, nextPoint);
        }

        return;        
      }
      
      // Case: prevVertex exists, nextVertex doesn't exist, 
      // that is, vertex is lastVertex.      
      if (prevVertex != undefined) {        
        var prevPoint = prevVertex.geometry.getCoordinates();
        var prevLine = prevVertex.nextLine;        
        prevLine.geometry.setCoordinates([prevPoint, point]);

        // We should change direction of arrow at the vertex
        vertex.image.setCoordinates(prevPoint, point);         
        return;        
      }
            
      // Case: nextVertex exists, prevVertex doesn't exist, 
      // that is, vertex is firstVertex. 
      vertex.image.geometry.setCoordinates(point);
      
      var nextPoint = nextVertex.geometry.getCoordinates();
      var nextLine = vertex.nextLine;        
      nextLine.geometry.setCoordinates([point, nextPoint]);

      // Case when vertex.nextVertex is lastVertex:
      // in that case your should change 
      // direction of arrow at lastVertex.
      if (nextVertex.nextVertex == undefined) {            
        nextVertex.image.setCoordinates(point, nextPoint);                  
      }
      return;            
    }

    
    /** Remove all vetrices and line segments from Path and from map. */    
    clear() {
      var map = this.map;
           
      if (this.length == 0 ) return;
      
      var vertex = this.lastVertex;  
      map.geoObjects.remove(vertex);
      map.geoObjects.remove(vertex.image);
      
      for(var i=1; i < this.length; i++) {
        vertex = vertex.prevVertex; 
        map.geoObjects.remove(vertex);
        map.geoObjects.remove(vertex.image);
        map.geoObjects.remove(vertex.nextLine);
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
        var vertex = this.firstVertex;      
        for(var i=0; i<height.length; i++) {
          vertex.properties.set("hintContent", "h=" + 
                                       Math.floor(height[i]) + "м");        
          vertex = vertex.nextVertex;
        }
        for(var i=height.length; i<this.length; i++) {
          vertex.properties.set("hintContent", "Невозможно!");        
          vertex = vertex.nextVertex;                    
        }
      }      
    }   
  }
  
  provide(Path);      
});      
