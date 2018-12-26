ymaps.modules.define('Output', [],
function(provide) {

  var Output = {};
  
  Output.print = function(calculator, heightOutput, path) {

    var heightArray = calculator.getHeight();
    
    if (heightArray.length > 0) {
      
      path.printBallonsAndHints(heightArray);
            
      var startHeight = heightArray[0];
      var finalHeight = heightArray[heightArray.length - 1];
      
      heightOutput.print(finalHeight);
                      
      if (finalHeight == null) {
        $("#finalHeight").val("не определена");      
      } else {
        var fh = Math.floor(finalHeight);           
        $("#finalHeight").val(fh);
      }      

      if (startHeight == null) {
        $("#startHeight").val("не определена");          
      } else {
        var sh = Math.floor(startHeight);           
        $("#startHeight").val(sh);
      }     
    }              
  }
    
  provide(Output);  
}); 