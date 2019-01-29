ymaps.modules.define('Keyboard', [
  'Output', 
  'Constant'
],
function(
  provide,
  Output, 
  Constant
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
    //windOutput, 
    //heightOutput, 
    path
  ) {
    
    
    
    //  Change Wind by keyboard.
    $("html").keydown(function(e) {
   
      var angle = windList.currentWind.getAngle(),
          value = windList.currentWind.getValue();
          
      var key = e.which;
      switch(key) {
        case 39:
          angle += 5;
          //wind.setAngle(angle);
          windList.setCurrentAngle(angle);
          $("#windDirectionInput").val(angle);
          calculatePrintRresults();           
          break;
        case 37:
          angle -= 5;
          //wind.setAngle(angle);
          windList.setCurrentAngle(angle);
          $("#windDirectionInput").val(angle);
          calculatePrintRresults();          
          break;
        case 38:
          if (value <= Constant.maxWindValue - 1) {
            value++;            
            //wind.setValue(value);
            windList.setCurrentValue(value);
            $("#windValueInput").val(value);
            calculatePrintRresults();
          }           
          break;
        case 40:
          if (value >= 1) {
            value--;
            //wind.setValue(value);
            windList.setCurrentValue(value);            
            $("#windValueInput").val(value);
            calculatePrintRresults();
          }          
          break;
        case 9:  // Tab keydown event
          e.preventDefault();
          windList.moveCurrentPointerToNext();
          windList.printCurrentWindWindow();           
          break;          
      }
      
    });

    // To loose focus after pressing Enter on <input>
    // This is for dzHeightMenu and chuteMenu  
    $("input").keypress(function(e) {
      if (e.keyCode === 13 || e.keyCode === 9) {  // Enter keycode
        $("input").blur();     // Forced loose of focus
      }    
    });
    
        
    function calculatePrintRresults() {     
      if (path.length > 0) {      
        calculator.calculateHeight();   
        Output.print(calculator, path);
      }      
      //windOutput.print(windList.currentWind);             
    }
  }
    
  provide(Keyboard);  
}); 