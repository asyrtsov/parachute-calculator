var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ymaps.modules.define('WindPointsList', [], function (provide) {
  var WindPointsList = function () {
    function WindPointsList(point) {
      _classCallCheck(this, WindPointsList);

      this.firstPoint = point;
      this.firstPoint.nextPoint = null;
      this.length = 1;
      this.currentPoint = point;
    }

    _createClass(WindPointsList, [{
      key: 'addPoint',
      value: function addPoint(point) {
        this.currentPoint.nextPoint = point;
        this.currentPoint = point;
        this.length++;
      }
    }]);

    return WindPointsList;
  }();

  provide(WindPointsList);
});