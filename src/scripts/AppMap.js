ymaps.modules.define('AppMap', [
  'Map', 
  'control.ZoomControl', 
  'Constant'  
],
function(provide, Map, ZoomControl, Constant) {
  
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
      
      this.path = path;
      this.heightOutput = heightOutput;
      this.calculator = calculator;
      this.arrow = arrow;
      this.dz = dz;
      this.defaultZoom = Constant.defaultZoom;
      
      this.searchControl.events.add('resultshow', function(e) {
                
        this.path.clear();
        this.heightOutput.print([this.calculator.getStartHeight()]);
         
        this.setZoom(this.defaultZoom);
         
        this.arrow.geometry.setCoordinates(this.getCenter());
         
        var index = e.get('index');    
        var geoObjectsArray = this.searchControl.getResultsArray();
        var resultName = geoObjectsArray[index].properties.get('name');

        var newDz = {
          name: resultName, 
          mapCenter: this.getCenter()
        };    
        this.dz.push(newDz);    
        $("#dz").append("<option>" + newDz.name + "</option>");    
        $("#dz").children()[this.dz.length - 1].selected = true;    
      }.bind(this));      
    }
        
  } 
  provide(AppMap);  
});   