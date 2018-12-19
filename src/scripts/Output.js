ymaps.modules.define('Output', [],
function(provide) {

  var Output = {};
  
  Output.print = function(calculator, heightOutput, path) {
    
    if (path.length > 0) {
      var height = calculator.getHeight();

      heightOutput.print(height);
        
      $("#startHeight").val(Math.floor(calculator.getStartHeight()));
      $("#finalHeight").val(Math.floor(calculator.getFinalHeight())); 

      printHeightHints(height);
    } else {
      var v;
      if (path.pathDirection) {
        v = Math.floor(calculator.getStartHeight());                
      } else {
        v = Math.floor(calculator.getFinalHeight());
      }
        
      heightOutput.print([v]);
      $("#startHeight").val(v);
      $("#finalHeight").val(v);   
    }
      
      
    

    /**
     * Print heights in vertices hints.
     * @param {number[]} height - heights in Path vertices.
     */      
    
    function printHeightHints(height) {
      if (path.length > 0) {      
        var vertex = path.firstVertex;      
        for(var i=0; i<height.length; i++) {
          vertex.properties.set("hintContent", "h=" + 
                                       Math.floor(height[i]) + "м");
          vertex.heightPlacemark.properties.set("iconContent",
                                       Math.floor(height[i]) + "м");
                                       
          vertex = vertex.nextVertex;
        }
        for(var i=height.length; i<path.length; i++) {
          vertex.properties.set("hintContent", "&#x26D4;");
          vertex.heightPlacemark.properties.set("iconContent", "Сюда не долететь!");        
          vertex = vertex.nextVertex;                    
        }
      }      
    }  
    
  }
    
  provide(Output);  
}); 