ymaps.modules.define('AppMap', [
  'Map', 
  'control.ZoomControl'  
],
function(provide, Map, ZoomControl) {
  
  class AppMap extends Map {

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
       
      var searchControl = this.controls.get('searchControl');
      searchControl.options.set('size', 'small');
      searchControl.options.set('noPlacemark', true);
      searchControl.options.set('noSelect', true);      
    }
  } 
  provide(AppMap);  
});   