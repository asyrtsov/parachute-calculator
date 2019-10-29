ymaps.modules.define('Path', [
  'Vertex',
  'Edge',
  'Constant'
],
function(
  provide,
  Vertex,
  Edge,
  Constant
) {
  /**
   * List of Vertices and Edges.
   * Image of Last Vertex is Triangle. Images of other Vertices are Circles.
   */
  class Path {
    /**
     * @param {Map} map - link to Yandex map.
     */
    constructor(map) {
      this.map = map;
      this.firstVertex = null;
      this.lastVertex = null;
      // number of vertices
      this.length = 0;

      // If pathDirection is true, we add new vertex to the start of Path;
      // if false, we add it to end of Path.
      this.pathDirection = true;

      // radius for inner circle vertices, in meters
      this.vertexRadius = Constant.isMobile ? 4 : 4;
      // radius for outer invisible circles, in meters
      this.vertexEventRadius = Constant.isMobile ? 6*this.vertexRadius : 3*this.vertexRadius;

      // On the map: line segments should be under vertex images,
      // vertex images should be under vertices
      this.vertexZIndex = 2;
      this.vertexImageZIndex = 1;
      this.edgeZIndex = 0;
      this.edgeImageZIndex = -1;

      // Distance from vertex to it's heightPlacemark
      this.heightPlacemarkShift = 0.0002;

      this.calculator = null;
    }


    setPathDirection(pathDirection) {
      this.pathDirection = pathDirection;
    }

    getPathDirection() {
      return(this.pathDirection);
    }

    setCalculator(calculator) {
      this.calculator = calculator;
    }

    setHeightOutput(heightOutput) {
      this.heightOutput = heightOutput;
    }

    /**
     * Add new Vertex to Path and to Map.
     * Add corresponding Edge to Path and to Map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Array} New Last Vertex and new Vast Edge of Path.
     */
    addVertex(point) {

      var vertex = new Vertex(point, this.vertexEventRadius, this);
      var edge = null;

      if (this.length > 0) {

        if (this.pathDirection) {
          // We should add vertex to the end of path

          var lastPoint = this.lastVertex.getCoordinates();
          vertex.setTriangleVertex(lastPoint);

          edge = new Edge(this.lastVertex, vertex, this);

          if (this.length > 1) {
            this.lastVertex.setCircleVertex(this.vertexRadius);
            this.lastVertex.prevEdge.calculateEdgeRectangles(); 
          }  

          this.lastVertex = vertex;          
        } else {
          // We should add vertex to the beginning of path

          vertex.setCircleVertex(this.vertexRadius);

          if (this.length == 1) {
            this.firstVertex.setTriangleVertex(point);
          } 

          edge = new Edge(vertex, this.firstVertex, this);
      
          this.firstVertex = vertex;
        }

        edge.addToMap();

      } else {  // this.length == 0;        
        this.firstVertex = vertex;
        this.lastVertex = vertex;
        vertex.setCircleVertex(this.vertexRadius);
      }
      
      vertex.addToMap();

      this.length++;

      this.calculator.calculateHeight();
      this.printHeightsAndWindPoints();

      return([vertex, edge]);
    }


    /**
     * Divide Edge by point.
     * Point should be on that Edge.
     * @param {Edge} edge
     * @param {number[]} point - Yandex.maps coordinates.
     * @return {Array} New Vertex and two new Edges.
     */
    divideEdge(edge, point) {

      var prevVertex = edge.prevVertex,
          nextVertex = edge.nextVertex;
          
      var edgeChuteDirection = edge.getChuteDirection();
         
      var vertex = new Vertex(point, this.vertexEventRadius, this);    
      vertex.setCircleVertex(this.vertexRadius);

      var edge1 = new Edge(prevVertex, vertex, this, edgeChuteDirection);
      var edge2 = new Edge(vertex, nextVertex, this, edgeChuteDirection);

      this.length++;

      edge.removeFromMap();
      vertex.addToMap();
      edge1.addToMap();
      edge2.addToMap();

      this.calculator.calculateHeight();
      this.printHeightsAndWindPoints();

      return([vertex, edge1, edge2]);
    }

    /**
     * Remove vertex from Path and from map.
     * @param {Vertex} vertex
     * @return {(Edge|null)} Edge between previous and next vertices.
     */
    removeVertex(vertex) {

      vertex.removeFromMap();

      var prevVertex = vertex.prevVertex;
      var nextVertex = vertex.nextVertex;

      var edge = null;

      if (this.length > 1) {
        if ((prevVertex != null) && (nextVertex != null)) {

          var prevEdge = vertex.prevEdge;
          var nextEdge = vertex.nextEdge;
          
          var edgeChuteDirection = 
            prevEdge.getChuteDirection() || nextEdge.getChuteDirection();

          prevEdge.removeFromMap();
          nextEdge.removeFromMap();
          
          var prevPoint = prevVertex.getCoordinates();
          
          if (nextVertex == this.lastVertex) {
            nextVertex.setTriangleVertex(prevPoint);
          } 

          edge = new Edge(prevVertex, nextVertex, this, edgeChuteDirection);
          edge.addToMap();

        } else if (nextVertex == null) {  // last vertex case
          var prevEdge = vertex.prevEdge;

          prevEdge.removeFromMap(); 

          this.lastVertex = prevVertex;
          this.lastVertex.nextVertex = null;
          this.lastVertex.nextEdge = null;

          if (prevVertex.prevVertex != null) {

            var prevPrevPoint = prevVertex.prevVertex.getCoordinates();

            prevVertex.setTriangleVertex(prevPrevPoint);
            prevVertex.prevEdge.calculateEdgeRectangles();  
          }

          if (!this.calculator.getCalculationDirection()) {
            if (!this.pathDirection) {
              this.calculator.setFinalHeight(this.lastVertex.height);  
            } 
          }
        } else {  // first vertex case

          vertex.nextEdge.removeFromMap(); 

          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;

          if (this.length == 2) {
            nextVertex.setCircleVertex(this.vertexRadius);
          }

          if (this.calculator.getCalculationDirection()) {
            if (this.pathDirection) {
              this.calculator.setStartHeight(this.firstVertex.height);  
            } 
          } 
        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }

      this.length--;

      if (this.length > 0) {
        this.calculator.calculateHeight();
        this.printHeightsAndWindPoints();
      }

      return(edge);
    }

    /**
     * Drag vertex with neibour edges.
     * @param {Vertex} vertex
     */
    dragVertex(vertex) {
 
      this.calculator.calculateHeight();
      this.printHeightsAndWindPoints();

      if (vertex.nextEdge != null) {
        vertex.nextEdge.calculateEdgeRectangles();
      }

      if (vertex.prevEdge != null) {
        vertex.prevEdge.calculateEdgeRectangles();
      }
    }


    /** Remove all vetrices and edges from Path and from map. */
    clear() {

      if (this.length > 0 ) {

        var vertex = this.lastVertex;

        vertex.removeFromMap();

        for(var i=1; i < this.length; i++) {
          vertex = vertex.prevVertex;
          vertex.removeFromMap();
          vertex.nextEdge.removeFromMap();
        }

        this.length = 0;
        this.lastVertex = null;
      }

      this.calculator.boundaryHeights.makeHeightsEqual(); 
      this.calculator.windList.removeWindVertices();
    }


    /**
     * Print heights in vertices ballons and hints.
     * Print wind points on the Path.
     */
    printHeightsAndWindPoints() {
      if (this.length > 0) {

        if (this.calculator.getCalculationDirection()) {
          
          if (this.firstVertex.height == null) {
            let vertex = this.lastVertex;          
            while(vertex != this.firstVertex) {

              vertex.printHint("h=?");
              if (vertex.singleClickingIsOn) {              
                vertex.turnOffSingleClicking();
              }               
              vertex = vertex.prevVertex;              
            }
            
            // Now: vertex = this.firstVertex

            vertex.printPlacemark("Введите высоту");
            vertex.printHint("h=?");
            if (vertex.singleClickingIsOn) {             
              vertex.turnOffSingleClicking();
            }             
                        
            this.calculator.windList.removeWindVertices();                                      
            return;  
          }            
       
          var vertex = this.firstVertex;
          
          // First unreachable vertex placemark will be shown, 
          // next placemarks will be hide. 
          var firstUnreachable = true;

          while(vertex != null) {
            
            if (!vertex.singleClickingIsOn) {             
              vertex.turnOnSingleClicking();
            } 
            
            if (typeof(vertex.height) == 'number') {
              vertex.printHint("h=" + Math.floor(vertex.height) + " м");
              vertex.printPlacemark(Math.floor(vertex.height) + " м");
                
            } else {
              vertex.printHint("&#x26D4;");
              vertex.printPlacemark("Сюда не долететь!");
              if (firstUnreachable) {
                firstUnreachable = false;
              } else {
              }
            }
            vertex = vertex.nextVertex;
          }
        } else {
                    
          if (this.lastVertex.height == null) {

            let vertex = this.firstVertex;          
            while(vertex != this.lastVertex) {
              vertex.printHint("h=?");
              if (vertex.singleClickingIsOn) {              
                vertex.turnOffSingleClicking();
              }               
              vertex = vertex.nextVertex;              
            }
            
            // Now: vertex = this.lastVertex

            vertex.printPlacemark("Введите высоту");
            vertex.printHint("h=?");
            if (vertex.singleClickingIsOn) {             
              vertex.turnOffSingleClicking();
            }             
                        
            this.calculator.windList.removeWindVertices();                                      
            return;  
          }  
                      
          var vertex = this.lastVertex;

          var firstBackUnreachable = true;

          while(vertex != null) {

            if (!vertex.singleClickingIsOn) {             
              vertex.turnOnSingleClicking();
            }
          
            if (typeof(vertex.height) == 'number') {
              vertex.printHint("h=" + Math.floor(vertex.height) + " м");
              vertex.printPlacemark(Math.floor(vertex.height) + " м");
            } else {
              vertex.printHint("&#x26D4;");
              vertex.printPlacemark("Отсюда не долететь!");
              if (firstBackUnreachable) {
                firstBackUnreachable = false;
              } 
            }
            vertex = vertex.prevVertex;
          }
        }

        this.calculator.windList.createWindVertices();
      }
    }
  }
  provide(Path);
});