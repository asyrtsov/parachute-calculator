/** @module Path */      
ymaps.modules.define('Path', [
  'Circle', 
  'Polyline',
  'Placemark',  
  'CircleVertex', 
  'TriangleVertex',
  'Vertex', 
  'Edge'  
],
function(
  provide, 
  Circle, 
  Polyline, 
  Placemark, 
  CircleVertex, 
  TriangleVertex, 
  Vertex, 
  Edge
) {     
  /**
   * List of vertices and edges of Chute Path.
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
      
      
      this.calculator = null;
      this.heightOutput = null;
      
  
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
      
      var vertex = new Vertex(point, this.vertexOuterRadius, this);
            
      var newEdge = null;
              
      if (this.length > 0) {
                          
        var lastPoint = this.lastVertex.geometry.getCoordinates();    
                
        newEdge = new Edge(lastPoint, point, this); 
        
        map.geoObjects.add(newEdge);
               
        // We change last Triengle vertex to Circle vertex
        map.geoObjects.remove(this.lastVertex.image);        
        this.lastVertex.image = 
          new CircleVertex(lastPoint, this.vertexRadius, this.imageZIndex);
        map.geoObjects.add(this.lastVertex.image);
                        
        this.lastVertex.nextVertex = vertex;
        vertex.prevVertex = this.lastVertex;
        
        this.lastVertex.nextLine = newEdge; 
        newEdge.prevVertex = this.lastVertex;        
                
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

      this.calculateAndPrintHeights();     
   
      return([vertex, newEdge]);       
    }
    
            
    /**
     * Divide edge of Path by point.
     * Point should be on that line segment. 
     * @param {Polyline} line
     * @param {number[]} point - Yandex.maps coordinates.
     * @return {Array} New vertex and two new line segments of Path.     
     */        
    divideEdge(edge, point) {
      var map = this.map;

      var prevVertex = edge.prevVertex,
          nextVertex = edge.prevVertex.nextVertex;
          
      var prevPoint = prevVertex.geometry.getCoordinates(), 
          nextPoint = nextVertex.geometry.getCoordinates();
          
      var vertex = new Vertex(point, this.vertexOuterRadius, this);            
      vertex.image = new CircleVertex(point, this.vertexRadius, this.imageZIndex);
      
      var newEdge1 = new Edge(prevPoint, point, this);
      var newEdge2 = new Edge(point, nextPoint, this);
      
      vertex.prevVertex = prevVertex;
      vertex.nextVertex = nextVertex;
      
      prevVertex.nextVertex = vertex;
      nextVertex.prevVertex = vertex;
 
      prevVertex.nextLine = newEdge1;
      vertex.nextLine = newEdge2;
      
      newEdge1.prevVertex = prevVertex;
      newEdge2.prevVertex = vertex;
      
      this.length++;

      map.geoObjects.remove(edge);
      map.geoObjects.add(vertex.image);
      map.geoObjects.add(vertex);
      map.geoObjects.add(vertex.heightPlacemark);
      map.geoObjects.add(newEdge1);
      map.geoObjects.add(newEdge2);
      
      this.calculateAndPrintHeights();
            
      return([vertex, newEdge1, newEdge2]);      
    }
    

    /**
     * Remove vertex from Path and from map.
     * @param {Vertex} removingVertex
     * @return {Polyline} Edge between previous and next vertices. 
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
      
      var newEdge = null;
      
      if (this.length > 1) {
        if ((prevVertex != undefined) && (nextVertex != undefined)) {
          
          var removingEdge1 = prevVertex.nextLine;
          var removingEdge2 = removingVertex.nextLine;
          
          map.geoObjects.remove(removingEdge1);
          map.geoObjects.remove(removingEdge2);
          
          var prevPoint = prevVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();
          
          newEdge = new Edge(prevPoint, nextPoint, this); 

          this.map.geoObjects.add(newEdge);
          
          prevVertex.nextLine = newEdge;
          prevVertex.nextVertex = nextVertex;
          nextVertex.prevVertex = prevVertex;
          
          newEdge.prevVertex = prevVertex;
          
          
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
          var removingEdge = prevVertex.nextLine;
          map.geoObjects.remove(removingEdge);
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
          
          // If we remove first vertex, initial height will change. 
          this.calculator.setStartHeight(this.calculator.height[1]);
          $("#startHeight").val(Math.floor(this.calculator.height[1]));
          
        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }
      
      this.length--;
      
      this.calculateAndPrintHeights();
            
      return(newEdge);
    }

    
    /**
     * Drag vertex with neibour line segments.
     * @param {Vertex} vertex
     */     
    dragVertex(vertex) {
      var map = this.map;
      
      
      this.calculateAndPrintHeights();
      
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


      this.heightOutput.print([this.calculator.getStartHeight()]);
      
    }



    /**
     * Print heights in vertex hints and in 
     * height output window.
     */
    calculateAndPrintHeights() {
      var height = this.calculator.calculateHeight();
      this.printHeightHints(height);       
      this.heightOutput.print(height);               
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
