ymaps.modules.define('Path', [
  'Vertex',
  'Edge',
  'Constant',
],
function(provide, Vertex, Edge, Constant) {
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
      this.baseVertex = null;

      this.baseVertexHeight = Constant.defaultBaseHeight;
      this.length = 0;    // number of vertices
      this.calculator = null;
      this.reactDomRender = null;
    }


    setCalculator(calculator) {
      this.calculator = calculator;
    }

    setReactDomRender(reactDomRender) {
      this.reactDomRender = reactDomRender;
    }


    /**
     * Add new Vertex to Path and to Map.
     * Add corresponding Edge to Path and to Map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Array} New Last Vertex and new Vast Edge of Path.
     */
    addVertex(point, isAddedtoEnd) {
      var vertex = new Vertex(this.map, point, this);
      //vertex.chuteImage.setCalculator(this.calculator);
      vertex.setCalculator(this.calculator);

      var edge = null;

      if (this.length > 0) {
        if (isAddedtoEnd) {
          // We should add vertex to the end of path
          var lastPoint = this.lastVertex.getCoordinates();
          vertex.setTriangleImage(lastPoint);

          edge = new Edge(this.lastVertex, vertex, this);

          if (this.length > 1) {
            this.lastVertex.setCircleImage();
            this.lastVertex.prevEdge.calculateEdgeRectangles();
          }

          this.lastVertex = vertex;
          this.lastVertex.setIsBetweenBaseAndLast(true);

          vertex.prevVertex.chuteImage.show();
        } else {
          // We should add vertex to the beginning of path
          vertex.setCircleImage();

          if (this.length == 1) {
            this.firstVertex.setTriangleImage(point);
          }

          edge = new Edge(vertex, this.firstVertex, this);

          this.firstVertex = vertex;
          this.firstVertex.setIsBetweenBaseAndLast(false);

          vertex.chuteImage.show();
        }

        vertex.addToMap();
        edge.addToMap();
        //vertex.prevVertex.chuteImage.show();
        this.length++;

        this.calculator.calculateHeight(isAddedtoEnd);

      } else {  // this.length == 0;
        vertex.setStrokeColor('#FFC107');  // Yellow color
        vertex.setHeightPlacemarkColor('bg-warning');  // Yellow color
        vertex.setCircleImage();
        this.firstVertex = vertex;
        this.lastVertex = vertex;
        this.baseVertex = vertex;
        this.firstVertex.setHeight(this.baseVertexHeight);
        vertex.isBetweenBaseAndLast = null;
        var str = Math.floor(vertex.height) + '&nbsp;м';
        vertex.printHint('h=' + str);
        vertex.printPlacemark(str);

        vertex.addToMap();
        this.length++;
      }

      return([vertex, edge]);
    }

    /**
     * You shouldn't setBaseVertex to vertex with height == null
     * or height < 0.
     * @param {Vertex} vertex
     */
    setBaseVertex(newBaseVertex) {

      var isBetweenBaseAndLast = newBaseVertex.isBetweenBaseAndLast;

      var vStart = isBetweenBaseAndLast ? this.baseVertex : newBaseVertex;
      var vFinal = isBetweenBaseAndLast ? newBaseVertex : this.baseVertex;

      var vertex = vStart;
      var wind = this.calculator.windList.lastWind;
      var isVertex = true;

      // Changing directions for part of path (and corresponding winds)
      // between baseVertex and newBaseVertex (we want calculation results
      // to be the same for newBaseVertex)
      while(true) {
        if (isVertex) {  // current list item is path vertex.
          while(true) {
            if (vertex.height > wind.vertex.height) {
              break;
            } else {
              wind = wind.prevWind;
              if (wind == null) break;
            }
          }

          if (wind == null || vertex.nextVertex.height >= wind.vertex.height) {
            isVertex = true;
            this.copyDirection(vertex, vertex.nextVertex, isBetweenBaseAndLast);
            vertex = vertex.nextVertex;
            if (vertex == vFinal) break;
          } else {
            isVertex = false;
            this.copyDirection(vertex, wind.vertex, isBetweenBaseAndLast);
          }
        } else {  // current list item is wind vertex.
          while(true) {
            if (wind.vertex.height > vertex.height) {
              break;
            } else {
              vertex = vertex.nextVertex;
              if (vertex == null) break;
            }
          }
          var prevWind = wind.prevWind;
          if (prevWind.vertex.height > vertex.height) {
            isVertex = false;
            this.copyDirection(wind.vertex, wind.prevWind.vertex, isBetweenBaseAndLast);
          } else {
            isVertex = true;
            this.copyDirection(wind.vertex, vertex, isBetweenBaseAndLast);
            if (vertex == vFinal) break;
          }
          wind = prevWind;
        }
      }


      //this.baseVertex.setStrokeColor(this.baseVertex.color);
      this.baseVertex.setStrokeColor('#0000FF');
      this.baseVertex.setHeightPlacemarkColor('bg-info');
      this.baseVertex.reRender();
      /*
      if (this.baseVertex.imageIsTriangle) {
        this.baseVertex.setTriangleImage(
            this.baseVertex.prevVertex.getCoordinates(), 'bg-info');
      } else {
        this.baseVertex.setCircleImage('bg-info');
      }  */
      // Yellow color.
      newBaseVertex.setStrokeColor('#FFC107');
      newBaseVertex.setHeightPlacemarkColor('bg-warning');
      newBaseVertex.reRender();
      /*
      if (newBaseVertex.imageIsTriangle) {
        newBaseVertex.setTriangleImage(
            newBaseVertex.prevVertex.getCoordinates(), 'bg-warning');
      } else {
        newBaseVertex.setCircleImage('bg-warning');
      } */
      this.baseVertex = newBaseVertex;
      //this.setVerticesIsBetweenBaseAndLast();

      // Set isBetweenBaseAndLast for all vertices.
      this.baseVertex.isBetweenBaseAndLast = null;
      var v = this.baseVertex;
      while((v = v.prevVertex)!= null) {
        v.isBetweenBaseAndLast = false;
      }
      var v = this.baseVertex;
      while((v = v.nextVertex) != null) {
        v.isBetweenBaseAndLast = true;
      }

      //$("#baseVertexHeight").val(Math.floor(this.baseVertex.height));
      this.baseVertexHeight = this.baseVertex.height;
      this.calculator.calculateHeight();

      console.log('path.baseVertexHeight:' + this.baseVertexHeight);

      this.reactDomRender();
    }

    /**
     * We suppose that vertex1.height > vertex2.height.
     */
    copyDirection(vertex1, vertex2, isBetweenBaseAndLast) {
      if (isBetweenBaseAndLast) {
        vertex2.chuteImageBack.chuteDirection =
            vertex1.chuteImage.chuteDirection;
        //vertex2.chuteImageBack.show();
        vertex1.chuteImage.hide();
      } else {
        vertex1.chuteImage.chuteDirection =
            vertex2.chuteImageBack.chuteDirection;
        //vertex1.chuteImage.show();
        vertex2.chuteImageBack.hide();
      }
    }




    setBaseVertexHeight(height) {
      this.baseVertexHeight = height;
      if (this.length > 0) {
        this.baseVertex.setHeight(height);

        //this.calculator.clearVertexDirections();
        this.calculator.calculateHeight();
      }
    }


    /*
    setVerticesIsBetweenBaseAndLast() {
      this.baseVertex.isBetweenBaseAndLast = null;
      var v = this.baseVertex;
      while((v = v.prevVertex)!= null) {
        v.isBetweenBaseAndLast = false;
      }
      var v = this.baseVertex;
      while((v = v.nextVertex) != null) {
        v.isBetweenBaseAndLast = true;
      }
    }  */


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

      var vertex = new Vertex(this.map, point, this);
      //vertex.chuteImage.setCalculator(this.calculator);
      vertex.setCalculator(this.calculator);

      vertex.setCircleImage();

      var edge1 = new Edge(prevVertex, vertex, this);
      var edge2 = new Edge(vertex, nextVertex, this);

      if (vertex.prevVertex.isBetweenBaseAndLast == true ||
          vertex.prevVertex.isBetweenBaseAndLast == null) {
        vertex.setIsBetweenBaseAndLast(true);
      } else {
        vertex.setIsBetweenBaseAndLast(false);
      }

      this.length++;

      edge.removeFromMap();
      vertex.addToMap();
      edge1.addToMap();
      edge2.addToMap();

      this.calculator.calculateHeight(vertex.isBetweenBaseAndLast);
      return([vertex, edge1, edge2]);
    }

    /**
     * Remove vertex from Path and from map.
     * @param {Vertex} vertex
     */
    removeVertex(vertex) {

      if (this.length == 1) {
        vertex.removeFromMap();
        this.length = 0;
        this.firstVertex = null;
        this.lastVertex = null;
        this.baseVertex = null;
      } else if (vertex == this.baseVertex) {
        alert('Нельзя удалить базовую вершину, если число вершин больше одной!');
      } else {
        vertex.removeFromMap();

        var prevVertex = vertex.prevVertex;
        var nextVertex = vertex.nextVertex;

        if ((prevVertex != null) && (nextVertex != null)) {
          var prevEdge = vertex.prevEdge;
          var nextEdge = vertex.nextEdge;
          prevEdge.removeFromMap();
          nextEdge.removeFromMap();

          if (nextVertex == this.lastVertex) {
            var prevPoint = prevVertex.getCoordinates();
            nextVertex.setTriangleImage(prevPoint);
          }

          var edge = new Edge(prevVertex, nextVertex, this);
          edge.addToMap();

        } else if (nextVertex == null) {  // last vertex case
          vertex.prevVertex.chuteImage.hide();

          var prevEdge = vertex.prevEdge;
          prevEdge.removeFromMap();

          this.lastVertex = prevVertex;
          this.lastVertex.nextVertex = null;
          this.lastVertex.nextEdge = null;

          if (prevVertex.prevVertex != null) {
            var prevPrevPoint = prevVertex.prevVertex.getCoordinates();
            prevVertex.setTriangleImage(prevPrevPoint);
            prevVertex.prevEdge.calculateEdgeRectangles();
          }
        } else {  // first vertex case
          vertex.nextVertex.chuteImageBack.hide();
          vertex.nextEdge.removeFromMap();

          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;

          if (this.length == 2) {
            nextVertex.setCircleImage();
          }
        }

        this.length--;
        this.calculator.calculateHeight(vertex.isBetweenBaseAndLast);
      }
    }

    /**
     * Drag vertex with neibour edges.
     * @param {Vertex} vertex
     */
    dragVertex(vertex) {
      this.calculator.calculateHeight(vertex.isBetweenBaseAndLast);

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

      this.calculator.windList.clearDirections();
      this.calculator.calculateHeight();
    }

  }
  provide(Path);
});