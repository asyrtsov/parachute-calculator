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
    constructor() {

      // Array of Dropzones and their coordinates.
      var dz = [
        {name: "Коломна", mapCenter: [55.091289443603706, 38.917269584802675]}, 
        {name: "Пущино", mapCenter: [54.78929269708931,37.64268598670033]}, 
        {name: "Ватулино", mapCenter: [55.663193308717396,36.14121807608322]}
      ];    
        
      super("map", {
        center: dz[0].mapCenter,    
        zoom: Constant.defaultZoom
      }, {
        suppressMapOpenBlock: true  // remove button 'open in yandex maps'
      });
      
      this.dz = dz; 
 
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

      // remove standart map zoom for double click
      this.events.add('dblclick', function(e) {
        e.preventDefault();  
      }); 

      this.menu = null;       
    }
    
    /**
     * Processing of yandex.maps search
     */
    setSearchProcessor(calculator) {

      this.calculator = calculator;    
      this.path = calculator.path;
      this.windList = calculator.windList;
      
      this.defaultZoom = Constant.defaultZoom;
      
      this.searchControl.events.add('resultshow', function(e) {
                
        this.path.clear(); 
        this.setZoom(this.defaultZoom);        
        this.windList.shiftList(this.getCenter());
                 
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