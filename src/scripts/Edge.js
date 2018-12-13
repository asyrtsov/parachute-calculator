ymaps.modules.define('Edge', [
  'Polyline'       
],
function(provide, Polyline) {
  /**
   * Edge of Path.
   */
  class Edge extends Polyline {
    /**
     * @param {number[]} point1 - Yandex maps coordinates. 
     * @param {number[]} point2 - Yandex maps coordinates.
     * @param {Path} path - Link to path; we need it because 
     * clicking of edge change path.     
     */
    constructor(point1, point2, path) {
      super([point1, point2], {}, {zIndex: path.lineZIndex});
     
      this.path = path;
     
      this.events.add('click', function(e) {
        e.stopPropagation();          
        var point = e.get('coords');
        this.path.divideEdge(this, point);                
      }.bind(this));    
    }        
  } 
  provide(Edge);  
}); 