var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ymaps.modules.define('Calculator', ['VectorMath', 'Constant'], function (provide, VectorMath, Constant) {
  /**
   * This class calculates:
   * a) heights at all vertices of the Path
   * (it will be kept in vertex.height varialables where vertex belongs
   * to Path),
   * b) points on the Path where wind changes (it will be kept in
   * wind.vertex varialables where wind belongs to WindList).
   */
  var Calculator = function () {
    /**
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Chute} chute - Chute velocity.
     * @param {WindList} windList
     */
    function Calculator(path, chute, windList) {
      _classCallCheck(this, Calculator);

      this.path = path;
      this.chute = chute;
      this.windList = windList;

      // If edgeChuteVelocity is positive and less than this value,
      // will will suppose that edgeChuteVelocity is equals this value. In m/s.
      this.minEdgeChuteVelocity = 0.001;
    }

    /**
     * Calculate first wind that less than this vertex.height.
     * @param {Vertex} vertex
     * @returns {Wind | null}
     */


    _createClass(Calculator, [{
      key: 'calculateVertexNextWind',
      value: function calculateVertexNextWind(vertex) {
        if (vertex == this.path.lastVertex || vertex.height <= 0) {
          return null;
        }
        var wind = this.windList.lastWind;
        while (true) {
          if (wind.height < vertex.height) {
            return wind.height >= vertex.nextVertex.height ? wind : null;
          }
          wind = wind.prevWind;
          if (wind == null) {
            return null;
          }
        }
      }

      /**
       *
       */

    }, {
      key: 'calculatePathWindList',
      value: function calculatePathWindList() {
        var wind = this.windList.lastWind;
        var windVertex = wind.vertex;
        var pathVertex = this.path.firstVertex;
        var vertex = pathVertex.height >= windVertex.height ? pathVertex.height : windVertex.height;
        while (true) {}
      }
    }, {
      key: 'calculatePathWindList',
      value: function calculatePathWindList() {}

      /**
       * Clearing directions: skydiver will fly face forward.
       */
      /*
      clearVertexDirections() {
        var wind = this.windList.firstWind;
        while(true) {
          wind.vertex.chuteImage.chuteDirection = true;
          wind.vertex.chuteImageBack.chuteDirection = true;
          wind = wind.nextWind;
          if (wind == null) break;
        }
        var vertex = this.path.firstVertex;
        while(true) {
          if (vertex == null) break;
          vertex.chuteImage.chuteDirection = true;
          vertex.chuteImageBack.chuteDirection = true;
          vertex = vertex.nextVertex;
        }
      }  */

      /**
       * Main calculation function.
       */

    }, {
      key: 'calculateHeight',
      value: function calculateHeight() {
        var fromBaseToLast = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (this.path.length == 0) {
          this.windList.hide();
          return;
        }

        switch (fromBaseToLast) {
          case true:
            this.calculateHeightForward();
            break;

          case false:
            this.calculateHeightBack();
            break;

          case null:
            this.calculateHeightForward();
            this.calculateHeightBack();
        }
      }

      /**
       * Case: calculation from Base Vertex to Last Vertex
       * (height is decreasing).
       */

    }, {
      key: 'calculateHeightForward',
      value: function calculateHeightForward() {
        var path = this.path,
            chute = this.chute,
            windList = this.windList,
            map = this.path.map;

        //console.log('calculateHeightForward');

        var vertexA = path.baseVertex;
        var wind = windList.lastWind;

        // Skip to wind corresponding to base vertex
        // (first wind, such that wind.height < vertexA.height)
        // Note: height in base vertex should be >= 0.
        if (vertexA.height > 0) {
          while (wind.height >= vertexA.height) {
            wind = wind.prevWind;
          }
        } else {
          wind = windList.firstWind;
        }

        // Case: nothing to calculate.
        if (vertexA == path.lastVertex) {
          while (wind != null) {
            wind.vertex.hide();
            wind = wind.prevWind;
          }
          return;
        }

        // vertexB will always be PathVertex,
        // later vertexA can be PathVertex or WindVertex.
        var vertexB = vertexA.nextVertex;

        var edgeChuteDirection;
        var chutePolarAngle;
        var chuteCanFlyAlongLine;

        if (vertexA.height > 0) {
          while (true) {
            // edgeChuteVelocity is velocity along edge [pointA, pointB] at pointA.
            // 'wind' is a wind in pointA.
            // Our aim is to calculate height in pointB.

            var pointA = vertexA.getCoordinates();
            var pointB = vertexB.getCoordinates();
            edgeChuteDirection = vertexA.chuteImage.chuteDirection;

            var calcResults = this.calculateChuteVelocity(pointA, pointB, chute, wind, edgeChuteDirection);

            var edgeChuteVelocity = calcResults.chuteEdgeVelocity;
            chutePolarAngle = calcResults.chutePolarAngle;
            // Convert from Radians to Degrees.
            chutePolarAngle = chutePolarAngle / Math.PI * 180;
            chuteCanFlyAlongLine = calcResults.chuteCanFlyAlongLine;

            if (!chuteCanFlyAlongLine) {
              break;
            }

            if (edgeChuteVelocity < 0) {
              break;
            }

            if (edgeChuteVelocity < this.minEdgeChuteVelocity) {
              edgeChuteVelocity = this.minEdgeChuteVelocity;
            }

            if (edgeChuteVelocity > 0) {
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
              var t1 = dist / edgeChuteVelocity; // t1 > 0 always.

              var t2;
              if (vertexA.height > 0) {
                // Main case.
                // t2 > 0 always.
                t2 = (vertexA.height - wind.height) / chute.verticalVel;
              } else {
                t2 = t1 + 1; // We only want t2 to be greater than t1.
              }

              if (t2 >= t1) {
                // Case: with current wind, chute will reach (vertexB) pointB

                if (edgeChuteVelocity == this.minEdgeChuteVelocity) break;

                vertexB.setHeight(vertexA.height - t1 * this.chute.verticalVel);
                vertexB.prevEdge.hideDividingPoint();
                vertexB.prevEdge.setColor('#0000FF'); // Blue color.

                if (t2 == t1) {
                  // It equals that vertexB.height == wind.height
                  wind.vertex.setCoordinates(pointB);
                  if (wind != windList.firstWind) {
                    wind = wind.prevWind;
                  }
                }

                //console.log(map.getPixelDistance(pointA, pointB));
                if (map.getPixelDistance(pointA, pointB) > 50) {
                  vertexA.chuteImage.setPosition(pointA, pointB, chutePolarAngle);
                  vertexA.chuteImage.show();
                } else {
                  vertexA.chuteImage.hide();
                }

                vertexA = vertexB;
                vertexB = vertexB.nextVertex;
                if (vertexB == null) break;
                continue;
              } else {
                var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);

                var pointC = VectorMath.findIntermediatePoint(pointA, pointB, t2 * edgeChuteVelocity / dist);

                if (map.getPixelDistance(pointA, pointC) > 50) {
                  vertexA.chuteImage.setPosition(pointC, pointA, chutePolarAngle);
                  vertexA.chuteImage.show();
                } else {
                  vertexA.chuteImage.hide();
                }

                wind.vertex.setCoordinates(pointC);
                vertexA = wind.vertex;

                if (wind != windList.firstWind) {
                  wind = wind.prevWind;
                } else {
                  // We reached height = 0 at vertexA.
                  break;
                }
                continue;
              }
            }
          }
        } else {
          // Case: path.baseVertex.height = 0.
          //vertexA.chuteImage.hide();
          wind.vertex.hide();
        }

        // Note: Now vertexA is a last achieved vertex.
        if (vertexB != null) {
          vertexB.setHeight(null);

          var pointA = vertexA.getCoordinates();
          var pointB = vertexB.getCoordinates();

          if (vertexA.type == 'pathVertex') {
            vertexA.nextEdge.hideDividingPoint();
            vertexA.nextEdge.setColor('#FF0000');
          } else {
            // vertexA is a wind vertex
            vertexB.prevEdge.setDividingPoint(pointA);
            vertexB.prevEdge.setColor('#0000FF', '#FF0000');
          }

          if (chuteCanFlyAlongLine && vertexA.height != 0 && map.getPixelDistance(pointA, pointB) > 50) {
            vertexA.chuteImage.show();
            vertexA.chuteImage.setPosition(pointA, pointB, chutePolarAngle);
          } else {
            vertexA.chuteImage.hide();
          }

          var vertex = vertexB.nextVertex;
          while (vertex != null) {
            vertex.setHeight(null);
            vertex.prevEdge.hideDividingPoint();
            vertex.prevEdge.setColor('#FF0000'); // Red color.
            vertex.prevVertex.chuteImage.hide();
            vertex = vertex.nextVertex;
          };
        }

        // Remove redundant wind points.
        if (wind != windList.firstWind) {
          while (wind != null) {
            wind.vertex.hide();
            wind = wind.prevWind;
          }
        } else if (vertexA.height > 0) {
          wind.vertex.hide();
        }
      }

      /**
       * Case: calculation from Base Vertex to First Vertex
       * (height is increasing).
       */

    }, {
      key: 'calculateHeightBack',
      value: function calculateHeightBack() {
        var path = this.path,
            chute = this.chute,
            windList = this.windList,
            map = this.path.map;

        //console.log('calculateHeightBack');

        var vertexB = path.baseVertex;
        var wind = windList.lastWind;

        // Find wind, corresponding to base vertex.
        if (vertexB.height > 0) {
          while (wind.height > vertexB.height) {
            wind = wind.prevWind;
          }
        } else {
          wind = windList.firstWind;
        }

        // Case: nothing to calculate.
        if (vertexB == path.firstVertex) {
          wind = wind.nextWind;
          while (wind != null) {
            wind.vertex.hide();
            wind = wind.nextWind;
          }
          return;
        }

        //console.log('vertexB.height:' + vertexB.height);
        //console.log('wind.height:' + wind.height);

        if (vertexB == path.lastVertex && vertexB.height == wind.height) {
          //console.log('hide')
          wind.vertex.hide();
        }

        // vertexA will always be PathVertex,
        // later vertexB can be PathVertex or WindVertex.
        var vertexA = vertexB.prevVertex;

        // We will show vertex.chuteImageBack instead of
        // vertex.chuteImage.
        /*
        var vertex = vertexA;
        while(vertex != null) {
          vertex.chuteImage.hide();
          vertex = vertex.prevVertex;
        } */

        var edgeChuteDirection;
        var chutePolarAngle;
        var chuteCanFlyAlongLine;

        while (true) {
          // Note: here pointA is only for setting direction;
          // if there will be changing wind on the edge,
          // the chute will fly with following velocity only after
          // last changing (in the direction, determined by
          // vector pointApointB)

          var pointA = vertexA.getCoordinates();
          var pointB = vertexB.getCoordinates();

          // WindVertex coincides with PathVertex.

          /*
          if (wind.height == vertexB.height) {
            wind.vertex.setCoordinates(pointB);
            //if (vertexB == path.lastVertex) {
              wind.vertex.chuteImage.hide();
            //}
          }  */

          //edgeChuteDirection = vertexA.chuteImage.chuteDirection;

          edgeChuteDirection = vertexB.chuteImageBack.chuteDirection;

          var calcResults = this.calculateChuteVelocity(pointA, pointB, chute, wind, edgeChuteDirection);
          var edgeChuteVelocity = calcResults.chuteEdgeVelocity;
          chutePolarAngle = calcResults.chutePolarAngle;
          chutePolarAngle = chutePolarAngle / Math.PI * 180;
          var chuteCanFlyAlongLine = calcResults.chuteCanFlyAlongLine;

          // In this case it is impossible to flight this edge
          // Explanation: edgeChuteVelocity will be the same
          // for any pointA from line pointApointB.
          if (!chuteCanFlyAlongLine || edgeChuteVelocity < 0) {
            break;
          }

          // Case: edgeChuteVelocity >= 0
          if (edgeChuteVelocity < this.minEdgeChuteVelocity) {
            edgeChuteVelocity = this.minEdgeChuteVelocity;
          }

          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
          var t1 = dist / edgeChuteVelocity; // t1 > 0 always.

          var t2;
          if (vertexB.height >= 0) {
            // Main case.
            if (wind != windList.lastWind) {
              // t2 > 0 always.
              t2 = (wind.nextWind.height - vertexB.height) / chute.verticalVel;
            } else {
              // wind = windList.lastWind.
              t2 = t1 + 1; // We only want t2 to be greater than t1.
            }
          } else {
            t2 = -vertexB.height / chute.verticalVel;
          }

          if (t2 >= t1) {
            // Case: with current wind, vertexB is reachable from vertexA

            if (edgeChuteVelocity == this.minEdgeChuteVelocity) break;

            vertexA.setHeight(vertexB.height + t1 * this.chute.verticalVel);
            vertexA.nextEdge.hideDividingPoint(); // Edge between A and B.
            // Blue color.
            vertexA.nextEdge.setColor('#0000FF');
            //vertexA.chuteImage.setPosition(pointA, pointB, chutePolarAngle);
            //vertexA.chuteImage.show();

            if (map.getPixelDistance(pointA, pointB) > 50) {
              vertexB.chuteImageBack.setPosition(pointA, pointB, chutePolarAngle);
              vertexB.chuteImageBack.show();
            } else {
              vertexB.chuteImageBack.hide();
            }

            // It equals: t1 == t2.
            if (wind.height == vertexA.height) {
              wind.vertex.setCoordinates(pointA);
              if (wind != windList.lastWind) {
                wind = wind.nextWind;
              }
              //if (vertexB == path.lastVertex) {
              //  wind.vertex.chuteImage.hide();
              //}
            }

            vertexB = vertexA;
            vertexA = vertexA.prevVertex;
            if (vertexA == null) break;
            continue;
          } else {
            // Case: with current wind, vertexB is NOT reachable from vertexA
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);

            var pointC = VectorMath.findIntermediatePoint(pointB, pointA, t2 * edgeChuteVelocity / dist);

            //if (vertexB.height >= 0) {
            //  wind = wind.nextWind;
            //}

            //if (wind != windList.lastWind) {
            wind = wind.nextWind;
            // }

            wind.vertex.setCoordinates(pointC);
            //vertexB = wind.vertex;
            //vertexB.chuteImage.setPosition(pointC, pointB, chutePolarAngle);
            //vertexB.chuteImage.show();

            if (map.getPixelDistance(pointC, pointB) > 50) {
              vertexB.chuteImageBack.setPosition(pointC, pointB, chutePolarAngle);
              vertexB.chuteImageBack.show();
            } else {
              vertexB.chuteImageBack.hide();
            }

            vertexB = wind.vertex;

            continue;
          }
        }

        if (vertexA != null) {
          vertexA.setHeight(null);
          //vertexA.chuteImage.hide();

          var pointA = vertexA.getCoordinates();
          var pointB = vertexB.getCoordinates();

          if (vertexB.type == 'pathVertex') {
            vertexA.nextEdge.hideDividingPoint();
            vertexA.nextEdge.setColor('#FF0000');
          } else {
            // vertexB is a WindVertex
            vertexA.nextEdge.setDividingPoint(pointB);
            vertexA.nextEdge.setColor('#FF0000', '#0000FF');
          }

          if (chuteCanFlyAlongLine && map.getPixelDistance(pointA, pointB) > 50) {
            vertexB.chuteImageBack.show();
            vertexB.chuteImageBack.setPosition(pointA, pointB, chutePolarAngle);
          } else {
            vertexB.chuteImageBack.hide();
          }

          //var vertex = vertexA.prevVertex;
          //vertexA.chuteImageBack.hide();
          var vertex = vertexA.prevVertex;
          while (vertex != null) {
            vertex.setHeight(null);
            vertex.nextEdge.hideDividingPoint();
            vertex.nextEdge.setColor('#FF0000'); // Red color.
            //vertex.chuteImage.hide();
            vertex.nextVertex.chuteImageBack.hide();
            vertex = vertex.prevVertex;
          };
        }

        // Hide redundant wind points.
        wind = wind.nextWind;
        while (wind != null) {
          wind.vertex.hide();
          wind = wind.nextWind;
        }
      }

      /**
       * Calculate Polar angle of Chute Velocity and
       * Absolute (relatively to Earth) Chute Velocity along Line Segment
       * (we suppose that chute is flying along this line segment).
       * @param {number[]} pointA - Yandex Maps Coordinates: (latitude, longitude).
       * @param {number[]} pointB - Yandex Maps Coordinates: (latitude, longitude).
       * @param {Chute} chute
       * @param {Wind} wind
       * @param [boolean] edgeChuteDirection - Skydiver can fly with his face directed
       * with or against edge.
       * @returns {Object} Object
       * @returns {number} Object.chuteEdgeVelocity - Absolute Chute Velocity along
       * line segment [pointA, pointB]; in m/sec;
       * Cases: chuteEdgeVelocity < 0 - In this case it is impossible to fly this segment;
       * chuteEdgeVelocity == 0 - hanging above pointA;
       * chuteEdgeVelocity > 0 - chute will fly from pointA to pointB.
       * @returns {number} Object.chutePolarAngle - Polar angle of Chute Velocity, in Radians.
       * @returns {boolean} Object.chuteCanFlyAlongLine - Is true iff chute velotity
       * is greater or equal to wind velocity projection to direction that is
       * perpendicula to the Line Segment.
       */

    }, {
      key: 'calculateChuteVelocity',
      value: function calculateChuteVelocity(pointA, pointB, chute, wind) {
        var edgeChuteDirection = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;


        /*
         * Let's find right orthonormal basis (e, f), first vector of which (e)
         * has the same direction with vector [pointA, pointB].
         * Yandex Maps Coordinates: (latitude, longitude)
         * Latitude is increasing from bottom to top (-90deg, 90deg)
         * Longitude is increasing from West to East (-180deg, 180deg)
         */

        function sign(a) {
          if (a > 0) return 1;
          if (a == 0) return 0;
          return -1;
        }

        var sx = sign(pointB[1] - pointA[1]);
        var sy = sign(pointB[0] - pointA[0]);

        var pointC = [pointA[0], pointB[1]];

        // now (ex, ey) are coordinates of vector e in standart orthonormal basis:
        // x has direction from left to right,
        // y has direction from bottom to top,
        // scale: 1 meter
        var ex = sx * ymaps.coordSystem.geo.getDistance(pointC, pointA);
        var ey = sy * ymaps.coordSystem.geo.getDistance(pointC, pointB);

        // Polar angle of vector (pointA, pointB)
        var angle1 = VectorMath.getPolarFromCartesian([ex, ey]).angle;

        var d = Math.sqrt(ex * ex + ey * ey);
        ex = ex / d;
        ey = ey / d;

        var fx = -ey;
        var fy = ex;

        // Let's find coordinates (we, wf) of vector 'wind' in basis (e, f).
        // (e, f) is orthogonal basis, so we = (wind, e), wf = (wind, f).

        var _wind$getXY = wind.getXY(),
            _wind$getXY2 = _slicedToArray(_wind$getXY, 2),
            wx = _wind$getXY2[0],
            wy = _wind$getXY2[1];

        var we = wx * ex + wy * ey;
        var wf = wx * fx + wy * fy;

        // Let's find coordinates (ce, cf) of chute velocity
        // in basis (e, f):
        var cf = -1 * wf;

        // it is impossible to fly this segment
        if (chute.horizontalVel < Math.abs(cf)) {
          var _chutePolarAngle = VectorMath.getPolarFromCartesian([0, sign(cf) * chute.horizontalVel]).angle;
          _chutePolarAngle += angle1;
          return {
            chuteEdgeVelocity: 0,
            chutePolarAngle: _chutePolarAngle,
            chuteCanFlyAlongLine: false
          };
        }

        var directionSign = edgeChuteDirection ? 1 : -1;
        var ce = directionSign * Math.sqrt(Math.pow(chute.horizontalVel, 2) - Math.pow(cf, 2));

        // Polar angle of Chute velocity relative to bases {e, f}
        var chutePolarAngle = VectorMath.getPolarFromCartesian([ce, cf]).angle;
        // Polar angle of Chute velocity
        chutePolarAngle += angle1;

        var chuteEdgeVelocity = ce + we;
        return {
          chuteEdgeVelocity: chuteEdgeVelocity,
          chutePolarAngle: chutePolarAngle,
          chuteCanFlyAlongLine: true
        };
      }
    }]);

    return Calculator;
  }();

  provide(Calculator);
});