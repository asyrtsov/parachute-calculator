ymaps.modules.define('Calculator', [
  'VectorMath',
  'Constant',
],
function(provide, VectorMath, Constant) {
  /**
   * This class calculates:
   * a) heights at all vertices of the Path
   * (it will be kept in vertex.height varialables where vertex belongs
   * to Path),
   * b) points on the Path where wind changes (it will be kept in
   * wind.vertex varialables where wind belongs to WindList).
   */
  class Calculator {
    /**
     * @param {Path} path - list of vertices and edges of Chute Path.
     * @param {Chute} chute - Chute velocity.
     * @param {WindList} windList
     */
    constructor(path, chute, windList) {
      this.path = path;
      this.chute = chute;
      this.windList = windList;

      // If edgeChuteVelocity is positive and less than this value,
      // will will suppose that edgeChuteVelocity is equals this value. In m/s.
      this.minEdgeChuteVelocity = 0.001;
    }


    /**
     * Main calculation function.
     */
    calculateHeight(fromBaseToLast = null) {
      if (this.path.length == 0) {
        this.windList.hide();
        return;
      }

      switch(fromBaseToLast) {
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
     * Case: calculation from Base Vertex to Last Vertex.
     */
    calculateHeightForward() {
      var path = this.path,
          chute = this.chute,
          windList = this.windList;

      var vertexA = path.baseVertex;
      var pointA = vertexA.getCoordinates();

      var zeroHeightIsReached = false;
      var wind = windList.lastWind;

      // Skip to wind corresponding to base vertex
      // (first wind, such that wind.height < vertexA.height)
      // Note: height in base vertex should be >= 0.
      if (vertexA.height > 0) {
        while(wind.height >= vertexA.height) {

          if (wind.height == vertexA.height) {
            wind.vertex.setCoordinates(pointA);
          }

          wind = wind.prevWind;
        }
      } else {
        wind = windList.firstWind;
        if (vertexA.height == 0) {
          wind.vertex.setCoordinates(pointA);
        }
      }

      // If there is nothing to calculate in forward direction,
      // we should hide nearby wind vertex and return.
      if (vertexA == path.lastVertex) {
        while(wind != null) {
         wind.vertex.hide();
         wind = wind.prevWind;
        }
        return;
      }

      var vertexB = vertexA.nextVertex;
      // Later, pointA can be any point of edge,
      // pointB always will be vertex,
      // pointA and pointB belong to the one edge
      var pointB = vertexB.getCoordinates();
      var pointAHeight = vertexA.height;

      var edgeChuteDirection;

      var pointAIsPathVertex = true;
      var chutePolarAngle;

      while(true) {
        // edgeChuteVelocity is velocity along edge [pointA, pointB] at pointA.
        // 'wind' is a wind in pointA.
        // Our aim is to calculate height in pointB.
        edgeChuteDirection = vertexA.chuteImage.chuteDirection;
        var calcResults =
            this.calculateChuteVelocity(
                pointA, pointB, chute, wind, edgeChuteDirection);

        var edgeChuteVelocity = calcResults.chuteEdgeVelocity;
        chutePolarAngle = calcResults.chutePolarAngle;
        // Convert from Radians to Degrees.
        chutePolarAngle = (chutePolarAngle / Math.PI) * 180;
        var chuteCanFlyAlongLine = calcResults.chuteCanFlyAlongLine;

        if (!chuteCanFlyAlongLine) {
          //console.log('chuteCanNotFlyAlongLine');
          break;
        }

        if (edgeChuteVelocity < 0) {
          //console.log('edgeVelocity < 0');
          break;
        }

        if (edgeChuteVelocity < this.minEdgeChuteVelocity) {
          console.log('edgeChuteVelocity:' + edgeChuteVelocity);
          edgeChuteVelocity = this.minEdgeChuteVelocity;
        }

        if (edgeChuteVelocity > 0) {
          var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
          var t1 = dist / edgeChuteVelocity;

          if (wind != windList.firstWind) {
            var t2 = (pointAHeight - wind.getHeight()) / chute.verticalVel;
            if (t2 >= t1) {
              // Case: with current wind, chute will reach (vertexB) pointB
              vertexB.setHeight(pointAHeight - t1 * this.chute.verticalVel);
              vertexB.prevEdge.hideDividingPoint();
              vertexB.prevEdge.setColor('#0000FF');  // Blue color.

              if (t2 == t1) {
                wind.vertex.setCoordinates(pointB);
                wind = wind.prevWind;
              }

              vertexA.chuteImage.setPosition(pointA, pointB, chutePolarAngle);
              vertexA.chuteImage.show();

              vertexA = vertexB;
              pointAIsPathVertex = true;
              vertexB = vertexB.nextVertex;
              if (vertexB == null) break;

              pointA = vertexA.getCoordinates();
              pointB = vertexB.getCoordinates();
              pointAHeight = vertexA.height;
              continue;
            } else {
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);

              var pointC = pointA;

              pointA =
                  VectorMath.findIntermediatePoint(
                      pointA, pointB, (t2 * edgeChuteVelocity)/dist);

              // pointAHeight = wind.getHeight();
              pointAHeight -= t2 * this.chute.verticalVel;

              vertexA.chuteImage.setPosition(pointC, pointA, chutePolarAngle);
              vertexA.chuteImage.show();

              wind.vertex.setCoordinates(pointA);
              vertexA = wind.vertex;
              pointAIsPathVertex = false;
              wind = wind.prevWind;
              continue;
            }
          } else {
            // case: wind = windList.firstWind
            //if (t1 > Constant.maxFlightTime) break;
            if (edgeChuteVelocity == this.minEdgeChuteVelocity) break;

            vertexB.setHeight(pointAHeight - t1 * this.chute.verticalVel);
            vertexB.prevEdge.hideDividingPoint();
            vertexB.prevEdge.setColor('#0000FF');  // Blue color.

            if (!zeroHeightIsReached) {
              if (vertexB.height == 0) {
                wind.vertex.setCoordinates(pointB);
                zeroHeightIsReached = true;
              }

              if ((pointAHeight > 0) && (vertexB.height < 0)) {
                var pointC =
                    VectorMath.findIntermediatePoint(
                        pointA, pointB, pointAHeight/(pointAHeight - vertexB.height));

                wind.vertex.setCoordinates(pointC);

                vertexA.chuteImage.setPosition(pointA, pointC, chutePolarAngle);
                vertexA.chuteImage.show();

                zeroHeightIsReached = true;

                vertexA = wind.vertex;
                pointAIsPathVertex = false;

                pointA = vertexA.getCoordinates();
                pointAHeight = vertexA.height;
                continue;
              }
            }

            vertexA.chuteImage.setPosition(pointA, pointB, chutePolarAngle);
            vertexA.chuteImage.show();

            vertexA = vertexB;
            pointAIsPathVertex = true;

            vertexB = vertexB.nextVertex;
            if (vertexB == null) break;

            pointA = vertexA.getCoordinates();
            pointB = vertexB.getCoordinates();
            pointAHeight = vertexA.height;
            continue;
          }
        }
      }

      if (vertexB != null) {
        vertexB.setHeight(null);

        if (pointAIsPathVertex) {
          vertexA.nextEdge.hideDividingPoint();
          vertexA.nextEdge.setColor('#FF0000');
        } else {  // pointA is a wind vertex
          vertexB.prevEdge.setDividingPoint(pointA);
          vertexB.prevEdge.setColor('#0000FF', '#FF0000');
        }

        vertexA.chuteImage.setPosition(pointA, pointA, chutePolarAngle);

        var vertex = vertexB.nextVertex;
        while(vertex != null) {
          vertex.setHeight(null);
          vertex.prevEdge.hideDividingPoint();
          vertex.prevEdge.setColor('#FF0000');  // Red color.
          vertex.prevVertex.chuteImage.hide();
          vertex = vertex.nextVertex;
        };
      }

      // Hide last wind points.
      if (!zeroHeightIsReached) {
        while(wind != null) {
          wind.vertex.hide();
          wind = wind.prevWind;
        }
      }
    }


    /**
     * Case: calculation from Base Vertex to First Vertex.
     */
    calculateHeightBack() {
      var path = this.path,
          chute = this.chute,
          windList = this.windList;

      var vertexB = path.baseVertex;
      var pointB = vertexB.getCoordinates();

      // true iff lastWindPoint will be on the Path after calculation.
      //var lastWindPointIsShown = false;

      //var wind = windList.firstWind;

      /*
      if (wind.getHeight() < vertexB.height) {
        // that is, 0 < vertexB.height
        while(true) {
          //wind.setVertexCoordinates(null);

          if (wind.nextWind == null) break;
          //if (wind.nextWind.getHeight() == null) break;

          if (wind.nextWind.getHeight() > vertexB.height) break;

          if (wind.nextWind.getHeight() == vertexB.height) {
            wind = wind.nextWind;
            //wind.setVertexCoordinates(pointB);
            wind.vertex.setCoordinates(pointB);
            break;
          }
          wind = wind.nextWind;
        }
      } */

      var wind = windList.lastWind;

      if (vertexB.height >= 0) {
        while(wind.height > vertexB.height) {
          wind = wind.prevWind;
        }

        if (wind.height == vertexB.height) {
          wind.vertex.setCoordinates(pointB);
        }

      } else {
        wind = windList.firstWind;
        //if (vertexB.height == 0) {
        //  wind.vertex.setCoordinates(pointB);
        //}
      }



      if (vertexB == path.firstVertex) {
        wind = wind.nextWind;
        while(wind != null) {
          //wind.nextWind.setVertexCoordinates(null);
          wind.vertex.hide();
          wind = wind.nextWind;
        }
        return;
      }

      var vertexA = vertexB.prevVertex;
      // pointA will always be vertex,
      // pointB can be vertex or point on the edge
      var pointA = vertexA.getCoordinates();
      var pointBHeight = vertexB.height;

      var edgeChuteDirection;
      var pointBIsPathVertex = true;
      var chutePolarAngle;

      while(true) {
        // Note: here pointA is only for setting direction;
        // if there will be changing wind on the edge,
        // the chute will fly with following velocity only after
        // last changing (in the direction, determined by
        // vector pointApointB)

        edgeChuteDirection = vertexA.chuteImage.chuteDirection;


        var edgeChuteVelocity =
            this.calculateChuteVelocity(
                pointA, pointB, chute,
                wind, edgeChuteDirection).chuteEdgeVelocity;

        // In this case it is impossible to flight this edge
        if (edgeChuteVelocity < 0) break;

        // Case: chute is hanging above pointB.
        // This is bottom boundary of current wind
        if (edgeChuteVelocity == 0) {
          if (wind == windList.lastWind) break;
          wind = wind.nextWind;
          pointBHeight = wind.getHeight();
          //wind.setVertexCoordinates(pointB);
          wind.vertex.setCoordinates(pointB);
          continue;
        }

        if (edgeChuteVelocity > 0) {
          if (wind != windList.lastWind) {
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
            var t1 = dist / edgeChuteVelocity;
            var t2 =
              (wind.nextWind.getHeight() - pointBHeight) / chute.verticalVel;

            if (t2 >= t1) {
              // Case: with current wind, pointB is reachable from pointA

              //if (t1 > Constant.maxFlightTime) break;

              vertexA.setHeight(pointBHeight + t1 * this.chute.verticalVel);
              // Blue color.
              vertexA.nextEdge.setColor('#0000FF');

              if (wind == windList.firstWind &&
                  pointBHeight < 0 &&
                  vertexA.height > 0) {
                var pointC =
                    VectorMath.findIntermediatePoint(
                        pointA, pointB,
                        vertexA.height/(vertexA.height - pointBHeight));

                //wind.setVertexCoordinates(pointC);
                wind.vertex.setCoordinates(pointC);
              }

              vertexB = vertexA;
              vertexA = vertexA.prevVertex;
              if (vertexA == null) break;
              //if (vertexA == path.firstVertex) break;

              pointA = vertexA.getCoordinates();
              pointB = vertexB.getCoordinates();
              pointBHeight = vertexB.height;

              edgeChuteDirection = vertexA.nextEdge.getChuteDirection();
              continue;
            } else {
              // Case: with current wind, pointB is NOT reachable from pointA
              var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);

              pointB =
                  VectorMath.findIntermediatePoint(
                      pointB, pointA, (t2 * edgeChuteVelocity)/dist);

              pointBHeight += t2 * this.chute.verticalVel;

              wind = wind.nextWind;
              //wind.setVertexCoordinates(pointB);
              wind.vertex.setCoordinates(pointC);
              continue;
            }
          } else {
            // case: wind == windList.lastWind
            var dist = ymaps.coordSystem.geo.getDistance(pointA, pointB);
            var t1 = dist / edgeChuteVelocity;
            if (t1 > Constant.maxFlightTime) break;

            vertexA.setHeight(pointBHeight + (t1 * this.chute.verticalVel));
            // Blue color.
            vertexA.nextEdge.setColor('#0000FF');
            //vertexA.height = pointBHeight + (t1 * this.chute.verticalVel);

            if (
                wind == windList.firstWind &&
                (pointBHeight < 0) &&
                (vertexA.height > 0)) {
              var pointC =
                  VectorMath.findIntermediatePoint(
                      pointA, pointB,
                      vertexA.height/(vertexA.height - pointBHeight));

              //wind.setVertexCoordinates(pointC);
              wind.vertex.setCoordinates(pointC);
            }

            vertexB = vertexA;
            vertexA = vertexA.prevVertex;
            if (vertexA == null) break;
            //if (vertexA == path.firstVertex) break;

            pointA = vertexA.getCoordinates();
            pointB = vertexB.getCoordinates();
            pointBHeight = vertexB.height;
            edgeChuteDirection = vertexA.nextEdge.getChuteDirection();
            continue;
          }
        }
      }

      while(vertexA != null) {
        vertexA.setHeight(null);
        // Red color.
        vertexA.nextEdge.setColor('#FF0000');
        vertexA = vertexA.prevVertex;
      }

      wind = wind.nextWind;
      while(wind != null) {
        //wind.setVertexCoordinates(null);
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
    calculateChuteVelocity(
        pointA, pointB, chute, wind, edgeChuteDirection = true) {

      /*
       * Let's find right orthonormal basis (e, f), first vector of which (e)
       * has the same direction with vector [pointA, pointB].
       * Yandex Maps Coordinates: (latitude, longitude)
       * Latitude is increasing from bottom to top (-90deg, 90deg)
       * Longitude is increasing from West to East (-180deg, 180deg)
       */

      function sign(a) {
        if (a>0) return 1;
        if (a==0) return 0;
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
      var angle1 =  VectorMath.getPolarFromCartesian([ex, ey]).angle;

      var d = Math.sqrt(ex*ex + ey*ey);
      ex = ex / d;
      ey = ey / d;

      var fx = -ey;
      var fy = ex;

      // Let's find coordinates (we, wf) of vector 'wind' in basis (e, f).
      // (e, f) is orthogonal basis, so we = (wind, e), wf = (wind, f).
      var [wx, wy] = wind.getXY();

      var we = wx * ex + wy * ey;
      var wf = wx * fx + wy * fy;

      // Let's find coordinates (ce, cf) of chute velocity
      // in basis (e, f):
      var cf = (-1)*wf;

      // it is impossible to fly this segment
      if (chute.horizontalVel < Math.abs(cf)) {
        let chutePolarAngle =
            (VectorMath.getPolarFromCartesian(
                 [0, sign(cf)*chute.horizontalVel])).angle;
        chutePolarAngle += angle1;
        return({
          chuteEdgeVelocity: 0,
          chutePolarAngle: chutePolarAngle,
          chuteCanFlyAlongLine: false
        });
      }

      var directionSign = edgeChuteDirection ? 1 : -1;
      var ce = directionSign * Math.sqrt(chute.horizontalVel**2 - cf**2);

      // Polar angle of Chute velocity relative to bases {e, f}
      var chutePolarAngle = (VectorMath.getPolarFromCartesian([ce, cf])).angle;
      // Polar angle of Chute velocity
      chutePolarAngle += angle1;

      var chuteEdgeVelocity = ce + we;
      return({
        chuteEdgeVelocity: chuteEdgeVelocity,
        chutePolarAngle: chutePolarAngle,
        chuteCanFlyAlongLine: true
      });
    }
  }

  provide(Calculator);
});