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
    
    
    setSearchProcessor(path, calculator, windList) {
      
      this.path = path;
      //this.heightOutput = path.heightOutput;
      this.calculator = calculator;
      //this.wind = windList.currentWind;
      this.windList = windList;
      this.defaultZoom = Constant.defaultZoom;
      
      this.searchControl.events.add('resultshow', function(e) {
                
        this.path.clear();
        //this.heightOutput.print([this.calculator.getStartHeight()]);
         
        this.setZoom(this.defaultZoom);
        
        var wind = this.windList.firstWind; 
        var [x0, y0] = wind.arrow.geometry.getCoordinates();        
        
        var [cx, cy] = this.getCenter();
        
        
        var a = (Math.cos((Math.PI/180)*x0) == 0) ? 
          1 : ((Math.cos((Math.PI/180)*cx))/Math.cos((Math.PI/180)*x0));
          
        console.log("a=" + a);  
        
        while(true) {
          var [x1, y1] = wind.arrow.geometry.getCoordinates();
          var [x, y] = [x1 - x0 + cx, (y1 - y0) + cy];
          
          console.log("x1 = " + x1);
          console.log("x = " + x);
          
          wind.arrow.setCoordinates([x, y]);
          if (wind == this.windList.lastWind) break;
          wind = wind.nextWind;                      
        }
        
        //this.wind.arrow.setCoordinates(this.getCenter());
         
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