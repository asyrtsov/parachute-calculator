ymaps.modules.define('AppMap', [
  'Map', 
  'control.ZoomControl'  
],
function(provide, Map, ZoomControl) {
  
  class AppMap extends Map {
    /**
     * @param {number[]} center 
     * @param {numner} zoom
     */
    constructor(center, zoom) {      
      super("map", {
        center: center,    
        zoom: zoom
      }, {
        suppressMapOpenBlock: true  // remove button 'open in yandex maps'
      });
 
      this.setType("yandex#satellite");  // view from space    
      this.cursors.push('arrow');  
      this.controls.remove('trafficControl');  
      this.controls.remove('zoomControl');
      var zoomControl = new ZoomControl({options: { 
        position: { right: 10, top: 105 }, 
        size: 'small'
      }}); 
      this.controls.add(zoomControl);
      this.controls.remove('geolocationControl');
      this.controls.remove('fullscreenControl');   
       
      this.searchControl = this.controls.get('searchControl');
      this.searchControl.options.set('size', 'small');
      this.searchControl.options.set('noPlacemark', true);
      this.searchControl.options.set('noSelect', true);          
    }
    
    
    setSearchProcessor(path, heightOutput, calculator, arrow, dz) {
      
      this.searchControl.events.add('resultshow', function(e) {
                
        path.clear();
        heightOutput.print([calculator.getStartHeight()]);
         
        this.setZoom(defaultZoom);
         
        arrow.geometry.setCoordinates(this.getCenter());
         
        var index = e.get('index');    
        var geoObjectsArray = this.searchControl.getResultsArray();
        var resultName = geoObjectsArray[index].properties.get('name');

        var newDz = {
          name: resultName, 
          mapCenter: this.getCenter()
        };    
        dz.push(newDz);    
        $("#dz").append("<option>" + newDz.name + "</option>");    
        $("#dz").children()[dz.length - 1].selected = true;    
      }.bind(this));      
    }
        
  } 
  provide(AppMap);  
});   