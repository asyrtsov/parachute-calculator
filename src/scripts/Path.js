ymaps.modules.define('Path', [
  'CircleVertex',
  'TriangleVertex',
  'Vertex',
  'PathEdge',
  'Constant'
],
function(
  provide,
  CircleVertex,
  TriangleVertex,
  Vertex,
  PathEdge,
  Constant
) {
  /**
   * List of vertices and edges of Chute Path.
   * Last vertex consist of one outer invisible Circle (Vertex class that
   * extends ymaps.Circle) and arrow-trianlge (TriangleVertex class that extends ymaps.Polyline).
   * Other vertices consist of one outer invisible Circle (Vertex class)
   * and one visible inner Circle (CircleVertex class that extends ymaps.Circle).
   * Outer vertex circles are invisible and serve for handy clicking
   * vertices.
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
      this.vertexOuterRadius = Constant.isMobile ? 6*this.vertexRadius : 3*this.vertexRadius;

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
     * Add new vertex to Path and to map.
     * Add corresponding edge to Path and to map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Array} New last vertex and new last edge of Path.
     */
    addVertex(point) {
      var map = this.map;

      var vertex = new Vertex(point, this.vertexOuterRadius, this);

      if (this.length > 0) {

        if (this.pathDirection) {
          // We should add vertex to the end of path

          var lastPoint = this.lastVertex.geometry.getCoordinates();

          vertex.image = new TriangleVertex(lastPoint, point, this.vertexImageZIndex);

          var newEdge = new PathEdge(lastPoint, vertex.image.getEdgePoint(), this);
          map.geoObjects.add(newEdge);
          map.geoObjects.add(newEdge.image);

          // We change previos last Triangle vertex to Circle vertex
          map.geoObjects.remove(this.lastVertex.image);
          this.lastVertex.image =
            new CircleVertex(lastPoint, this.vertexRadius, this.vertexImageZIndex);
          map.geoObjects.add(this.lastVertex.image);

          // lastVertex image changed from triangle to circle.
          // So edge from lastVertex.prevVertex to lastVertex should be lengthen.
          if (this.lastVertex.prevVertex != null) {
            // that is, lastVertex != firstVertex
            var lastlastPoint = this.lastVertex.prevVertex.geometry.getCoordinates();
            var lastEdge = this.lastVertex.prevVertex.nextLine;
            lastEdge.setCoordinates(lastlastPoint, lastPoint);
          }

          this.lastVertex.nextVertex = vertex;
          vertex.prevVertex = this.lastVertex;

          vertex.nextVertex = null;

          this.lastVertex.nextLine = newEdge;
          newEdge.prevVertex = this.lastVertex;

          this.lastVertex = vertex;
        } else {
          // We should add vertex to the beginning of path

          var firstPoint = this.firstVertex.geometry.getCoordinates();

          var newEdge = null;

          if (this.length == 1) {

            map.geoObjects.remove(this.firstVertex.image);
            this.firstVertex.image = new TriangleVertex(point, firstPoint, this.vertexImageZIndex);
            map.geoObjects.add(this.firstVertex.image);

            newEdge = new PathEdge(point, this.firstVertex.image.getEdgePoint(), this);

          } else {
            newEdge = new PathEdge(point, firstPoint, this);
          }

          map.geoObjects.add(newEdge);
          map.geoObjects.add(newEdge.image);

          vertex.nextVertex = this.firstVertex;
          this.firstVertex.prevVertex = vertex;

          vertex.prevVertex = null;

          vertex.nextLine = newEdge;
          newEdge.prevVertex = vertex;
          this.firstVertex = vertex;

          vertex.image = new CircleVertex(point, this.vertexRadius, this.vertexImageZIndex);
        }

      } else {  // this.length == 0;
        vertex.prevVertex = null;
        vertex.nextVertex = null;

        this.firstVertex = vertex;
        this.lastVertex = vertex;
        vertex.image = new CircleVertex(point, this.vertexRadius, this.vertexImageZIndex);
      }
      
      
      map.geoObjects.add(vertex.image);
      map.geoObjects.add(vertex);
      
      
      vertex.showPlacemark();      
      //map.geoObjects.add(vertex.heightPlacemark);

      this.length++;

      this.calculator.calculateHeight();
      this.printHeightsAndWindPoints();

      return([vertex, newEdge]);
    }


    /**
     * Divide edge of Path by point.
     * Point should be on that line segment.
     * @param {Edge} edge
     * @param {number[]} point - Yandex.maps coordinates.
     * @return {Array} New vertex and two new edges of Path.
     */
    divideEdge(edge, point) {
      var map = this.map;

      var prevVertex = edge.prevVertex,
          nextVertex = edge.prevVertex.nextVertex;
          
      var edgeChuteDirection = edge.getChuteDirection();
         
      var prevPoint = prevVertex.geometry.getCoordinates(),
          nextPoint = nextVertex.geometry.getCoordinates();

      var vertex = new Vertex(point, this.vertexOuterRadius, this);
      vertex.image = new CircleVertex(point, this.vertexRadius, this.vertexImageZIndex);

      var newEdge1 = new PathEdge(prevPoint, point, this, edgeChuteDirection);
 
      // In case when nextVertex is lastVertex
      if (nextVertex.nextVertex == null) {
        nextPoint = nextVertex.image.getEdgePoint();
      }

      var newEdge2 = new PathEdge(point, nextPoint, this, edgeChuteDirection);

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
      map.geoObjects.remove(edge.image);
      map.geoObjects.add(vertex.image);
      map.geoObjects.add(vertex);
      
      vertex.showPlacemark();
      //map.geoObjects.add(vertex.heightPlacemark);

      map.geoObjects.add(newEdge1);
      map.geoObjects.add(newEdge2);
      map.geoObjects.add(newEdge1.image);
      map.geoObjects.add(newEdge2.image);

      this.calculator.calculateHeight();
      this.printHeightsAndWindPoints();

      return([vertex, newEdge1, newEdge2]);
    }

    /**
     * Remove vertex from Path and from map.
     * @param {Vertex} removingVertex
     * @return {(Edge|null)} Edge between previous and next vertices.
     */
    removeVertex(removingVertex) {
      var map = this.map;

      map.geoObjects.remove(removingVertex);
      map.geoObjects.remove(removingVertex.image);

      if (removingVertex.placemarkIsShown) {
        removingVertex.hidePlacemark();
      } 
      //map.geoObjects.remove(removingVertex.heightPlacemark);

      var prevVertex = removingVertex.prevVertex;
      var nextVertex = removingVertex.nextVertex;

      var newEdge = null;

      if (this.length > 1) {
        if ((prevVertex != null) && (nextVertex != null)) {

          var removingEdge1 = prevVertex.nextLine;
          var removingEdge2 = removingVertex.nextLine;
          
          var edgeChuteDirection = 
            removingEdge1.getChuteDirection() || removingEdge2.getChuteDirection();

          map.geoObjects.remove(removingEdge1);
          map.geoObjects.remove(removingEdge1.image);
          map.geoObjects.remove(removingEdge2);
          map.geoObjects.remove(removingEdge2.image);

          var prevPoint = prevVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();

          prevVertex.nextVertex = nextVertex;
          nextVertex.prevVertex = prevVertex;

          var nextEdgePoint = null;

          // case when nextVertex is lastVertex
          // and so we have to change direction of
          // arrow (triangle) of lastVertex

          if (nextVertex.nextVertex == null) {
            map.geoObjects.remove(nextVertex.image);
            nextVertex.image =
              new TriangleVertex(prevPoint, nextPoint, this.vertexImageZIndex);
            map.geoObjects.add(nextVertex.image);

            nextEdgePoint = nextVertex.image.getEdgePoint();

          } else {
            nextEdgePoint = nextPoint;
          }

          newEdge = new PathEdge(prevPoint, nextEdgePoint, this, edgeChuteDirection);
          this.map.geoObjects.add(newEdge);
          this.map.geoObjects.add(newEdge.image);

          newEdge.prevVertex = prevVertex;
          prevVertex.nextLine = newEdge;

        } else if (nextVertex == null) {  // last vertex case
          var removingEdge = prevVertex.nextLine;
          map.geoObjects.remove(removingEdge);

          map.geoObjects.remove(removingEdge.image);

          this.lastVertex = prevVertex;
          prevVertex.nextVertex = null;
          prevVertex.nextLine = null;

          if (prevVertex.prevVertex != null) {
            map.geoObjects.remove(prevVertex.image);

            var prevPrevPoint = prevVertex.prevVertex.geometry.getCoordinates();
            var prevPoint = prevVertex.geometry.getCoordinates();
            prevVertex.image =
              new TriangleVertex(prevPrevPoint, prevPoint, this.vertexImageZIndex);
            map.geoObjects.add(prevVertex.image);

            prevVertex.prevVertex.nextLine.setCoordinates(prevPrevPoint, prevVertex.image.getEdgePoint());
          }

          // If we remove last vertex (pathDirection == false),
          // initial height will change.
          //if (!this.calculator.getCalculationDirection()) {
           // this.calculator.boundaryHeights.finalHeight = this.lastVertex.height;
          //  $("#finalHeight").val(Math.floor(this.lastVertex.height));
          //}

          if (!this.calculator.getCalculationDirection()) {
            if (!this.pathDirection) {
              this.calculator.setFinalHeight(this.lastVertex.height);  
            } 
          }
        } else {  // first vertex case
          map.geoObjects.remove(removingVertex.nextLine);
          map.geoObjects.remove(removingVertex.nextLine.image);

          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;

          if (this.length == 2) {
            var p = nextVertex.geometry.getCoordinates();
            map.geoObjects.remove(nextVertex.image);
            nextVertex.image =
              new CircleVertex(p, this.vertexRadius, this.vertexImageZIndex);
            map.geoObjects.add(nextVertex.image);
          }

          // If we remove first vertex (pathPosition == true),
          // initial height will change.
          //if (this.calculator.getCalculationDirection()) {
            //this.calculator.boundaryHeights.startHeight = this.firstVertex.height;
            //$("#startHeight").val(Math.floor(this.firstVertex.height));
          //}

          if (this.calculator.getCalculationDirection()) {
            if (this.pathDirection) {
              this.calculator.setStartHeight(this.firstVertex.height);  
            } 
          } 
          
          
          //this.calculator.setStartHeight(this.firstVertex.height);

        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }

      this.length--;

      if (this.length > 0) {
        this.calculator.calculateHeight();
        this.printHeightsAndWindPoints();
      }

      return(newEdge);
    }

    /**
     * Drag vertex with neibour edges.
     * @param {Vertex} vertex
     */
    dragVertex(vertex) {
      var map = this.map;

      this.calculator.calculateHeight();
      this.printHeightsAndWindPoints();

      // new vertex coordinates
      var point = vertex.geometry.getCoordinates();

      var nextVertex = vertex.nextVertex;
      var prevVertex = vertex.prevVertex;

      // Case: both prevVertex and nextVertex don't exist,
      // that is, path consists of one vertex
      if ((nextVertex == null) && (prevVertex == null)) {
        vertex.image.geometry.setCoordinates(point);
        return;
      }

      // Case: both prevVertex and nextVertex exist,
      // that is, this vertex is not first and not last.
      if ((nextVertex != null) && (prevVertex != null)) {

        vertex.image.geometry.setCoordinates(point);

        var nextPoint = nextVertex.geometry.getCoordinates();
        var prevPoint = prevVertex.geometry.getCoordinates();

        var nextLine = vertex.nextLine;
        var prevLine = prevVertex.nextLine;

        var nextEdgePoint = null;
        // Case when vertex.nextVertex is lastVertex:
        // in that case your should change
        // direction of arrow at lastVertex.
        if (nextVertex.nextVertex == null) {
          nextVertex.image.setCoordinates(point, nextPoint);

          nextEdgePoint = nextVertex.image.getEdgePoint();
        } else {
          nextEdgePoint = nextPoint;
        }

        nextLine.setCoordinates(point, nextEdgePoint);
        prevLine.setCoordinates(prevPoint, point);

        return;
      }

      // Case: prevVertex exists, nextVertex doesn't exist,
      // that is, vertex is lastVertex.
      if (prevVertex != null) {
        var prevPoint = prevVertex.geometry.getCoordinates();
        var prevLine = prevVertex.nextLine;

        // We should change direction of arrow at the vertex
        vertex.image.setCoordinates(prevPoint, point);

        var edgePoint = vertex.image.getEdgePoint();
        prevLine.setCoordinates(prevPoint, edgePoint);

        return;
      }

      // Case: nextVertex exists, prevVertex doesn't exist,
      // that is, vertex is firstVertex.
      vertex.image.geometry.setCoordinates(point);

      var nextPoint = nextVertex.geometry.getCoordinates();

      var nextEdgePoint = null;
      // Case when vertex.nextVertex is lastVertex:
      // in that case your should change
      // direction of arrow at lastVertex.
      if (nextVertex.nextVertex == null) {
        nextVertex.image.setCoordinates(point, nextPoint);
        nextEdgePoint = nextVertex.image.getEdgePoint();
      } else {
        nextEdgePoint = nextPoint;
      }

      var nextLine = vertex.nextLine;
      nextLine.setCoordinates(point, nextEdgePoint);

      return;
    }


    /** Remove all vetrices and edges from Path and from map. */
    clear() {
      var map = this.map;

      if (this.length > 0 ) {

        var vertex = this.lastVertex;
        map.geoObjects.remove(vertex);
        map.geoObjects.remove(vertex.image);
        
        if (vertex.placemarkIsShown) {
          vertex.hidePlacemark();
        }

        for(var i=1; i < this.length; i++) {
          vertex = vertex.prevVertex;
          map.geoObjects.remove(vertex);
          map.geoObjects.remove(vertex.image);
          map.geoObjects.remove(vertex.nextLine);
          map.geoObjects.remove(vertex.nextLine.image);
          
          if (vertex.placemarkIsShown) {
            vertex.hidePlacemark();
          }  
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
              if (vertex.placemarkIsShown) {                              
                vertex.hidePlacemark();
              }
              vertex.printHint("h=?");
              if (vertex.singleClickingIsOn) {              
                vertex.turnOffSingleClicking();
              }               
              vertex = vertex.prevVertex;              
            }
            
            // Now: vertex = this.firstVertex            
            if (!vertex.placemarkIsShown) {
              vertex.showPlacemark();
            }
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
              vertex.printHint("h=" + Math.floor(vertex.height) + "м");
              vertex.printPlacemark(Math.floor(vertex.height) + "м");

              if (!vertex.placemarkIsShown) {                  
                vertex.showPlacemark();
              }
            } else {
              vertex.printHint("&#x26D4;");
              vertex.printPlacemark("Сюда не долететь!");
              if (firstUnreachable) {
                firstUnreachable = false;
                if (!vertex.placemarkIsShown) {                  
                  vertex.showPlacemark();
                }
              } else {
                if (vertex.placemarkIsShown) {                  
                  vertex.hidePlacemark();
                }
              }
            }
            vertex = vertex.nextVertex;
          }
        } else {
                    
          if (this.lastVertex.height == null) {

            let vertex = this.firstVertex;          
            while(vertex != this.lastVertex) {
              if (vertex.placemarkIsShown) {                              
                vertex.hidePlacemark();
              }
              vertex.printHint("h=?");
              if (vertex.singleClickingIsOn) {              
                vertex.turnOffSingleClicking();
              }               
              vertex = vertex.nextVertex;              
            }
            
            // Now: vertex = this.lastVertex            
            if (!vertex.placemarkIsShown) {
              vertex.showPlacemark();
            }
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
              vertex.printHint("h=" + Math.floor(vertex.height) + "м");
              vertex.printPlacemark(Math.floor(vertex.height) + "м");

              if (!vertex.placemarkIsShown) {                  
                vertex.showPlacemark();
              }
            } else {
              vertex.printHint("&#x26D4;");
              vertex.printPlacemark("Отсюда не долететь!");
              if (firstBackUnreachable) {
                firstBackUnreachable = false;

                if (!vertex.placemarkIsShown) {                  
                  vertex.showPlacemark();
                }
              } else {
                if (vertex.placemarkIsShown) {                  
                  vertex.hidePlacemark();
                }
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