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

      this.baseVertex = null;
      this.baseVertexHeight = Constant.defaultBaseHeight;

      // number of vertices
      this.length = 0;

      // Radius of Circle Image of Vertices, in meters
      this.vertexRadius = Constant.isMobile ? 4 : 4;
      // Define size of Triangle Image of Vertices
      this.triangleScale = 1;
      // Radius for Event Circle of Vertices, in meters
      this.vertexEventRadius =
          Constant.isMobile ? 6*this.vertexRadius : 3*this.vertexRadius;
      // Width of Event Rectangle of Edges
      this.edgeEventRectangleWidth = 1;

      // On the map: line segments should be under vertex images,
      // vertex images should be under vertices
      this.vertexZIndex = 2;
      this.vertexImageZIndex = 1;
      this.edgeZIndex = 0;
      this.edgeImageZIndex = -1;

      this.calculator = null;

      this.pathBoundChange = this.pathBoundChange.bind(this);
      this.map.events.add('boundschange', this.pathBoundChange);
    }


    pathBoundChange(e) {
      var newZoom = e.get('newZoom'),
            oldZoom = e.get('oldZoom');
      if (newZoom != oldZoom) {
        var scale = (2**(oldZoom - newZoom));
        this.scale(scale);
      }
    }

    scale(scale) {
      this.vertexRadius *= scale;
      this.vertexEventRadius *= scale;
      this.edgeEventRectangleWidth *= scale;
      this.triangleScale *= scale;
      if (this.length > 0 ) {
        var vertex = this.lastVertex;
        vertex.scale(scale);
        for(var i=1; i < this.length; i++) {
          vertex = vertex.prevVertex;
          vertex.scale(scale);
          vertex.nextEdge.scale(scale);
        }
      }
    }


    setCalculator(calculator) {
      this.calculator = calculator;
    }


    /**
     * Add new Vertex to Path and to Map.
     * Add corresponding Edge to Path and to Map.
     * @param {number[]} point - Yandex.Maps coordinates, point = [x, y].
     * @return {Array} New Last Vertex and new Vast Edge of Path.
     */
    addVertex(point, isAddedtoEnd) {

      var vertex = new Vertex(point, this.vertexEventRadius, this);

      var edge = null;

      if (this.length > 0) {

        if (isAddedtoEnd) {
          // We should add vertex to the end of path

          var lastPoint = this.lastVertex.getCoordinates();
          vertex.setTriangleVertex(lastPoint);

          edge = new Edge(this.lastVertex, vertex, this);

          if (this.length > 1) {
            this.lastVertex.setCircleVertex(this.vertexRadius);
            this.lastVertex.prevEdge.calculateEdgeRectangles();
          }

          this.lastVertex = vertex;

          this.lastVertex.setIsBetweenBaseAndLast(true);
        } else {
          // We should add vertex to the beginning of path

          vertex.setCircleVertex(this.vertexRadius);

          if (this.length == 1) {
            this.firstVertex.setTriangleVertex(point);
          }

          edge = new Edge(vertex, this.firstVertex, this);

          this.firstVertex = vertex;

          this.firstVertex.setIsBetweenBaseAndLast(false);
        }

        vertex.addToMap();
        edge.addToMap();
        this.length++;

        this.calculator.calculateHeight(isAddedtoEnd);

      } else {  // this.length == 0;
        this.firstVertex = vertex;
        this.lastVertex = vertex;
        this.baseVertex = vertex;
        this.firstVertex.setHeight(this.baseVertexHeight);
        vertex.setStrokeColor('#FFFF00');
        vertex.setCircleVertex(this.vertexRadius);
        vertex.isBetweenBaseAndLast = null;
        vertex.printHint("h=" + Math.floor(vertex.height) + "&nbsp;м");
        vertex.printPlacemark(Math.floor(vertex.height) + "&nbsp;м");

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
    setBaseVertex(vertex) {
      this.baseVertex.setStrokeColor(this.baseVertex.color);
      this.baseVertex = vertex;
      // Yellow color.
      this.baseVertex.setStrokeColor('#FFFF00');
      this.setVerticesIsBetweenBaseAndLast();
      $("#baseVertexHeight").val(Math.floor(this.baseVertex.height));
      this.baseVertexHeight = this.baseVertex.height;
      //this.calculator.calculateHeight();
    }


    setBaseVertexHeight(height) {
      this.baseVertexHeight = height;
      if (this.length > 0) {
        this.baseVertex.setHeight(height);
        this.calculator.calculateHeight();
      }
    }


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
     * @return {(Edge|null)} Edge between previous and next vertices.
     */
    removeVertex(vertex) {

      if ((vertex == this.baseVertex) && (this.length > 1)) {
        alert('Вы не можете удалить базовую вершину!');
        return;
      }

      vertex.removeFromMap();
      if (vertex == this.lastVertex && vertex.prevVertex != null) {
        vertex.prevVertex.setChuteImageCoordinates(null);
      }

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
        } else {  // first vertex case
          vertex.nextEdge.removeFromMap();

          nextVertex.prevVertex = null;
          this.firstVertex = nextVertex;

          if (this.length == 2) {
            nextVertex.setCircleVertex(this.vertexRadius);
          }
        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }

      this.length--;

      if (this.length > 0) {
        this.calculator.calculateHeight(vertex.isBetweenBaseAndLast);
      }

      return(edge);
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

      this.calculator.windList.setNullCoordinates();
    }

  }
  provide(Path);
});