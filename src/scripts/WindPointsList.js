ymaps.modules.define('WindPointsList', [],
function(provide) {

  class WindPointsList {
    constructor(point) {
      this.firstPoint = point;
      this.firstPoint.nextPoint = null;
      this.length = 1;
      this.currentPoint = point;
    }  

    addPoint(point) {
      this.currentPoint.nextPoint = point;
      this.currentPoint = point;
      this.length++;
    }    
  }      
  provide(WindPointsList);  
});