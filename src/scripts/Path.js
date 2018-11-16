// List of vertices and lines of Path (ymaps.Circle, ymaps.Polyline) 
// All class methods change map  
// (because map is object and is copied by link)
      
ymaps.modules.define('Path', [
  'Circle', 
  'Polyline', 
  'YmapsCircleVertex', 
  'YmapsTriangleVertex'  
],
function(provide, Circle, Polyline, YmapsCircleVertex, YmapsTriangleVertex) {     
           
  class Path {  
    constructor(map, isMobile) {
      this.firstVertex = null;
      this.lastVertex = null;
      this.numberOfVertices = 0;
      this.map = map;
      // radius for image circle vertices, in meters
      this.vertexRadius = 7;
      // radius for outer invisible circles, in meters    
      this.vertexOuterRadius = isMobile ? this.vertexRadius*4 : this.vertexRadius;     
       
      this.addVertex = this.addVertex.bind(this);
      this.removeVertex = this.removeVertex.bind(this);
      this.clear = this.clear.bind(this);    
    }
    
    addVertex(point) {  // point = [x, y], Yandex.Maps coordinates,
      // bigger invisible circle is for more comfortable 
      // touching in Mobile case      
      var currentVertex = new ymaps.Circle([
        point, 
        this.vertexOuterRadius
      ], {}, {
        fillOpacity: 0,
        strokeOpacity: 0, 
        strokeWidth: 0
      });  

      currentVertex.events.add('dblclick', function(e) {
        e.stopPropagation();  // remove standart zoom for double click
        this.removeVertex(currentVertex);
      }.bind(this));
            
        
      if (this.numberOfVertices > 0) {
        var lastPoint = this.lastVertex.geometry.getCoordinates();
        
        currentVertex.image = new YmapsTriangleVertex(lastPoint, point);
      
        // We remove previous last circle. Add next line. 
        // Add previuos last circle. Add last circle.
        // The reason: lines should be UNDER circles        
        this.map.geoObjects.remove(this.lastVertex);
        this.map.geoObjects.remove(this.lastVertex.image);        
       
        // We change last Triengle vertex to Circle vertex 
        this.lastVertex.image = new YmapsCircleVertex(lastPoint, this.vertexRadius);
  
        this.lastVertex.nextLine = new ymaps.Polyline([lastPoint, point]);
        this.lastVertex.nextVertex = currentVertex;
        
        this.map.geoObjects.add(this.lastVertex.nextLine);   
        this.map.geoObjects.add(this.lastVertex.image);
        this.map.geoObjects.add(this.lastVertex);

        currentVertex.prevVertex = this.lastVertex;
      } else {  // this.numberOfVertices = 0;
        currentVertex.image = new YmapsCircleVertex(point, this.vertexRadius);        
        this.firstVertex = currentVertex;
      }

      this.map.geoObjects.add(currentVertex.image);
      this.map.geoObjects.add(currentVertex);
      
      this.lastVertex = currentVertex;        
      this.numberOfVertices++;      
    }
    
    removeVertex(removingVertex) {      
      this.map.geoObjects.remove(removingVertex);
      this.map.geoObjects.remove(removingVertex.image);
      
      var prevVertex = removingVertex.prevVertex;
      var nextVertex = removingVertex.nextVertex;
      
      if (this.numberOfVertices > 1) {
        if ((prevVertex != undefined) && (nextVertex != undefined)) {
          
          var removingLine1 = prevVertex.nextLine;
          var removingLine2 = removingVertex.nextLine;
          
          this.map.geoObjects.remove(removingLine1);
          this.map.geoObjects.remove(removingLine2);
          
          var prevPoint = prevVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();
          
          this.map.geoObjects.remove(prevVertex);  // lines should be UNDER circles
          this.map.geoObjects.remove(prevVertex.image);
          this.map.geoObjects.remove(nextVertex);
          this.map.geoObjects.remove(nextVertex.image);
          
          var currentLine = new ymaps.Polyline([prevPoint, nextPoint]);
          this.map.geoObjects.add(currentLine);
          
          prevVertex.nextLine = currentLine;
          prevVertex.nextVertex = nextVertex;
          nextVertex.prevVertex = prevVertex;
          
          this.map.geoObjects.add(prevVertex.image);
          this.map.geoObjects.add(prevVertex); 

          // case when nextVertex is lastVertex 
          // and so we have to change direction of 
          // arrow (triangle) of lastVertex
          if (nextVertex.nextVertex == undefined) {             
            nextVertex.image = new YmapsTriangleVertex(prevPoint, nextPoint);     
          }         
          this.map.geoObjects.add(nextVertex.image);
          this.map.geoObjects.add(nextVertex);
        } else if (nextVertex == undefined) {  // last circle case    
          var removingLine = prevVertex.nextLine;
          map.geoObjects.remove(removingLine);
          this.lastVertex = prevVertex;
          prevVertex.nextVertex = null;
          prevVertex.nextLine = null;
          if (prevVertex.prevVertex != undefined) {
            this.map.geoObjects.remove(prevVertex.image);
            this.map.geoObjects.remove(prevVertex);
            var prevPrevPoint = prevVertex.prevVertex.geometry.getCoordinates();
            var prevPoint = prevVertex.geometry.getCoordinates();            
            prevVertex.image = new YmapsTriangleVertex(prevPrevPoint, prevPoint);
            this.map.geoObjects.add(prevVertex.image);
            this.map.geoObjects.add(prevVertex);            
          }          
        } else {  // first circle case
          this.map.geoObjects.remove(removingVertex.nextLine); 
          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;           
          
          if (this.numberOfVertices == 2) {
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
      
      this.numberOfVertices--;
    }
     
    clear() {
      
      if (this.numberOfVertices == 0 ) return;
      
      var currentVertex = this.lastVertex;  
      this.map.geoObjects.remove(currentVertex);
      this.map.geoObjects.remove(currentVertex.image);
      
      for(var i=1; i < this.numberOfVertices; i++) {
        currentVertex = currentVertex.prevVertex; 
        this.map.geoObjects.remove(currentVertex);
        this.map.geoObjects.remove(currentVertex.image);
        this.map.geoObjects.remove(currentVertex.nextLine);
      }
      
      this.numberOfVertices = 0;
      this.lastVertex = null;  
    }          
  }
  
  provide(Path);      
});      
