ymaps.modules.define('Keyboard', [
  'Output'
],
function(
  provide,
  Output
) {

  var Keyboard = {};
  
  /**
   * Keys: left, right, up, down are for changing wind direction
   * and wind value.
   * Enter key on <input> tag will cause loose of focus.
   * @param {Wind} wind
   * @param {Calculator} calculator
   * @param {WindOutputElement} windOutput
   * @param {HeightOutputElement} heightOutput
   * @param {Path} path   
   */
  Keyboard.startKeyboardProcessing = function(
    windList, 
    calculator, 
    windOutput, 
    heightOutput, 
    path
  ) {
    
    var wind = windList.currentWind;
    
    //  Change Wind by keyboard.
    $("html").keydown(function(e) { 
      var key = e.which;
      switch(key) {
        case 39:
          wind.setAngle(wind.getAngle() + 5);
          $("#windDirectionInput").val(wind.angle);
          calculatePrintRresults();           
          break;
        case 37:
          wind.setAngle(wind.getAngle() - 5);
          $("#windDirectionInput").val(wind.angle);
          calculatePrintRresults();          
          break;
        case 38:          
          wind.setValue(wind.getValue() + 1);
          $("#windValueInput").val(wind.value);
          calculatePrintRresults();         
          break;
        case 40:         
         wind.setValue(wind.getValue() - 1);
          $("#windValueInput").val(wind.value);
          calculatePrintRresults();          
          break;
      }
      
    });

    // To loose focus after pressing Enter on <input>
    // This is for dzHeightMenu and chuteMenu  
    $("input").keypress(function(e) {
      if (e.keyCode === 13) {  // Enter keycode
        $("input").blur();     // Forced loose of focus
      }    
    });
    
    function calculatePrintRresults() {     
      if (path.length > 0) {      
        calculator.calculateHeight();   
        Output.print(calculator, heightOutput, path);
      }      
      windOutput.print(wind);             
    }
  }
    
  provide(Keyboard);  
}); 