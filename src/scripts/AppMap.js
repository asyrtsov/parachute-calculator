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


    /**
     * @param {Path} path
     * @param {Calculator} calculator
     * @param {HeightOutputElement} heightOutput
     */
    addClickEvent(path, calculator, heightOutput) {

      this.events.add('click', function(e) {
        var point = e.get('coords');
        
        var [lastVertex, lastLine] = path.addVertex(point);
              
        if (lastLine != null) {
          lastLine.events.add('click', 
                              processLineClick(lastLine));
        }

        function processLineClick(lastLine) {
          return (function(e) {
            e.stopPropagation();          
            var point = e.get('coords');
            var [vertex, prevLine, nextLine] = path.divideLine(lastLine, point);

            vertex.events.add('click', 
                              processVertexClick(vertex)); 
            
            vertex.events.add('dblclick', function(e) {
              e.stopPropagation();  // remove standart map zoom for double click
            });
                                                             
            vertex.events.add('drag', 
                                processVertexDrag(vertex));                             
                                
            prevLine.events.add('click', 
                        processLineClick(prevLine));                    

            nextLine.events.add('click', 
                                processLineClick(nextLine));

            var height = calculator.calculateHeight();
            path.printHeightHints(height);       
            heightOutput.print(height);                                                            
          });
        }

        lastVertex.events.add('click', 
                              processVertexClick(lastVertex));      

        // Process both click and dblclick                      
        function processVertexClick(lastVertex) {
          var clickNumber = 0;
          var placemarkIsShown = true;
          return (function(e) {
            e.stopPropagation();  // remove standart zoom for click
            clickNumber++;
            if (clickNumber == 1) {
              setTimeout(function() {  
                if (clickNumber == 1) {  // Single Click
                  placemarkIsShown = !placemarkIsShown;
                  
                  if (placemarkIsShown) {
                    this.geoObjects.add(lastVertex.heightPlacemark);
                  } else {
                    this.geoObjects.remove(lastVertex.heightPlacemark);                  
                  }
                                  
                  clickNumber = 0;
                } else {  // Double Click               
                  var newLine = path.removeVertex(lastVertex);
                  if (newLine != null) {
                    newLine.events.add('click', 
                                    processLineClick(newLine));       
                  }
                  var height = calculator.calculateHeight();
                  path.printHeightHints(height);       
                  heightOutput.print(height);     
                 
                }  
              }, 200);
            }  
          });
        } 
       
        lastVertex.events.add('dblclick', function(e) {
          e.stopPropagation();  // remove standart map zoom for double click
        });
                     
        lastVertex.events.add('drag', 
                              processVertexDrag(lastVertex)); 

        function processVertexDrag(lastVertex) {
          return (function(e) {
            e.stopPropagation();          
            path.dragVertex(lastVertex);
            var height = calculator.calculateHeight();
            path.printHeightHints(height);       
            heightOutput.print(height);          
          });
        }
        
        var height = calculator.calculateHeight();
        path.printHeightHints(height);       
        heightOutput.print(height);        
      });    
    
         
    }  

  } 
  provide(AppMap);  
});   