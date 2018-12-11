/** @module Path */      
ymaps.modules.define('Path', [
  'Circle', 
  'Polyline',
  'Placemark',  
  'CircleVertex', 
  'TriangleVertex'  
],
function(
  provide, 
  Circle, 
  Polyline, 
  Placemark, 
  CircleVertex, 
  TriangleVertex
) {     
  /**
   * List of vertices and line segments of Chute Path.
   * Line segments connect vertices.
   * Last vertex consist of one outer invisible Circle (ymaps.Circle)  
   * and arrow (TriangleVertex object that extends ymaps.Polyline).
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

      // On the map: line segments should be under vertex images, 
      // vertex images should be under vertices
      this.vertexZIndex = 2;      
      this.imageZIndex = 1;
      this.lineZIndex = 0;

      // Distance from vertex to it's heightPlacemark
      this.heightPlacemarkShift = 0.0002;
  
      //this.addVertex = this.addVertex.bind(this);
      //this.removeVertex = this.removeVertex.bind(this);
      //this.dragVertex = this.dragVertex.bind(this);
      //this.clear = this.clear.bind(this);          
    }
    
    /**
     * Add new vertex to Path and to map.
     * Add corresponding line segment to Path and to map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Array} New last vertex and new last line segment of Path.
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
        strokeWidth: 0, 
        zIndex: this.vertexZIndex
      });

      // Placemark for Height of Chute ot this vertex
      vertex.heightPlacemark = new ymaps.Placemark(
        [point[0] + this.heightPlacemarkShift, point[1]], 
        {}, 
        {
          preset: 'islands#blackStretchyIcon', 
          cursor: 'arrow'
        }
      );      
              
      if (this.length > 0) {
                          
        var lastPoint = this.lastVertex.geometry.getCoordinates();    
                

        var newLine = 
          new ymaps.Polyline([lastPoint, point], {}, {zIndex: this.lineZIndex});          
        map.geoObjects.add(newLine);

       
        //var newEdge = new PathEdge(lastPoint, point);          
        //map.geoObjects.add(newEdge.image);
        //console.log(newEdge.image); 
       
        
                
        // We change last Triengle vertex to Circle vertex
        map.geoObjects.remove(this.lastVertex.image);        
        this.lastVertex.image = 
          new CircleVertex(lastPoint, this.vertexRadius, this.imageZIndex);
        map.geoObjects.add(this.lastVertex.image);
                        
        this.lastVertex.nextVertex = vertex;
        vertex.prevVertex = this.lastVertex;
        
        this.lastVertex.nextLine = newLine; 
        newLine.prevVertex = this.lastVertex;        
                
        vertex.image = new TriangleVertex(lastPoint, point, this.imageZIndex);
      } else {  // this.length = 0;
        this.firstVertex = vertex;      
        vertex.image = new CircleVertex(point, this.vertexRadius, this.imageZIndex);  
      }
      
      map.geoObjects.add(vertex.image);
      map.geoObjects.add(vertex);
      map.geoObjects.add(vertex.heightPlacemark);
            
      this.lastVertex = vertex;        
      this.length++; 
   
      return([
        vertex, 
        (this.length > 1) ? vertex.prevVertex.nextLine : null      
      ]);       
    }
    
        
    /**
     * Divide line segment of Path by point.
     * Point should be on that line segment. 
     * @param {Polyline} line
     * @param {number[]} point - Yandex.maps coordinates.
     * @return {Array} New vertex and two new line segments of Path.     
     */        
    divideLine(line, point) {
      var map = this.map;

      var prevVertex = line.prevVertex,
          nextVertex = line.prevVertex.nextVertex;
          
      var prevPoint = prevVertex.geometry.getCoordinates(), 
          nextPoint = nextVertex.geometry.getCoordinates();

      var vertex = new ymaps.Circle([
        point, 
        this.vertexOuterRadius
      ], {}, {
        draggable: true,
        // vertex will be invisible
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0, 
        zIndex: this.vertexZIndex
      });
      
      vertex.image = new CircleVertex(point, this.vertexRadius, this.imageZIndex);

      // Placemark for Height of Chute ot this vertex
      vertex.heightPlacemark = new ymaps.Placemark(
        [point[0] + this.heightPlacemarkShift, point[1]], 
        {}, 
        {
          preset: 'islands#blackStretchyIcon', 
          cursor: 'arrow'
        }
      ); 
      
      var newLine1 = 
        new ymaps.Polyline([prevPoint, point], {}, {zIndex: this.lineZIndex});      

      var newLine2 = 
        new ymaps.Polyline([point, nextPoint], {}, {zIndex: this.lineZIndex});        

      vertex.prevVertex = prevVertex;
      vertex.nextVertex = nextVertex;
      
      prevVertex.nextVertex = vertex;
      nextVertex.prevVertex = vertex;
 
      prevVertex.nextLine = newLine1;
      vertex.nextLine = newLine2;
      
      newLine1.prevVertex = prevVertex;
      newLine2.prevVertex = vertex;
      
      this.length++;

      map.geoObjects.remove(line);
      map.geoObjects.add(vertex.image);
      map.geoObjects.add(vertex);
      map.geoObjects.add(vertex.heightPlacemark);
      map.geoObjects.add(newLine1);
      map.geoObjects.add(newLine2);
            
      return([vertex, newLine1, newLine2]);      
    }
    

    /**
     * Remove vertex from Path and from map.
     * @param {Circle} removingVertex
     * @return {Polyline} Line between previous and next vertices. 
     */    
    removeVertex(removingVertex) {
      var map = this.map;
    
      map.geoObjects.remove(removingVertex);
      map.geoObjects.remove(removingVertex.image);
      
      if (removingVertex.heightPlacemark != undefined) {
        map.geoObjects.remove(removingVertex.heightPlacemark);  
      }
      
      var prevVertex = removingVertex.prevVertex;
      var nextVertex = removingVertex.nextVertex;
      
      var newLine = null;
      
      if (this.length > 1) {
        if ((prevVertex != undefined) && (nextVertex != undefined)) {
          
          var removingLine1 = prevVertex.nextLine;
          var removingLine2 = removingVertex.nextLine;
          
          map.geoObjects.remove(removingLine1);
          map.geoObjects.remove(removingLine2);
          
          var prevPoint = prevVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();
                    
          newLine = 
            new ymaps.Polyline([prevPoint, nextPoint], {}, {zIndex: this.lineZIndex});
          this.map.geoObjects.add(newLine);
          
          prevVertex.nextLine = newLine;
          prevVertex.nextVertex = nextVertex;
          nextVertex.prevVertex = prevVertex;
          
          newLine.prevVertex = prevVertex;
          
          
          // case when nextVertex is lastVertex 
          // and so we have to change direction of 
          // arrow (triangle) of lastVertex
          if (nextVertex.nextVertex == undefined) {
            map.geoObjects.remove(nextVertex.image);            
            nextVertex.image = 
              new TriangleVertex(prevPoint, nextPoint, this.imageZIndex);
            map.geoObjects.add(nextVertex.image);            
          }         
        } else if (nextVertex == undefined) {  // last vertex case   
          var removingLine = prevVertex.nextLine;
          map.geoObjects.remove(removingLine);
          this.lastVertex = prevVertex;
          prevVertex.nextVertex = null;
          prevVertex.nextLine = null; 
          if (prevVertex.prevVertex != undefined) {
            map.geoObjects.remove(prevVertex.image);
            var prevPrevPoint = prevVertex.prevVertex.geometry.getCoordinates();
            var prevPoint = prevVertex.geometry.getCoordinates();            
            prevVertex.image = 
              new TriangleVertex(prevPrevPoint, prevPoint, this.imageZIndex);
            map.geoObjects.add(prevVertex.image);            
          }          
        } else {  // first vertex case
          map.geoObjects.remove(removingVertex.nextLine); 
          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;           
          
          if (this.length == 2) {
            var p = nextVertex.geometry.getCoordinates();
            map.geoObjects.remove(nextVertex.image);
            nextVertex.image = 
              new CircleVertex(p, this.vertexRadius, this.imageZIndex);
            map.geoObjects.add(nextVertex.image);
          }            
        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }
      
      this.length--;
      return(newLine);
    }

    
    /**
     * Drag vertex with neibour line segments.
     * @param {Circle} vertex
     */     
    dragVertex(vertex) {
      var map = this.map;
      
      // new vertex coordinates
      var point = vertex.geometry.getCoordinates();
      
      
      if (vertex.heightPlacemark != undefined) {
        vertex.heightPlacemark.geometry.setCoordinates(
          [point[0] + this.heightPlacemarkShift, point[1]]
        );
      } 
                       
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
      map.geoObjects.remove(vertex.heightPlacemark);
      
      for(var i=1; i < this.length; i++) {
        vertex = vertex.prevVertex; 
        map.geoObjects.remove(vertex);
        map.geoObjects.remove(vertex.image);
        map.geoObjects.remove(vertex.nextLine);
        map.geoObjects.remove(vertex.heightPlacemark);
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
          vertex.heightPlacemark.properties.set("iconContent",
                                       Math.floor(height[i]) + "м");
                                       
          vertex = vertex.nextVertex;
        }
        for(var i=height.length; i<this.length; i++) {
          vertex.properties.set("hintContent", "&#x26D4;");
          vertex.heightPlacemark.properties.set("iconContent", "Сюда не долететь!");        
          vertex = vertex.nextVertex;                    
        }
      }      
    }   
  }
  
  provide(Path);      
});      
