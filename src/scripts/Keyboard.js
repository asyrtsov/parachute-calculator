ymaps.modules.define('Keyboard', ['Constant'],
function(provide, Constant) {

  var Keyboard = {};
  
  /**
   * Keys: left, right, up, down are for changing wind direction
   * and wind value. TAB is for selecting next wind.
   * Enter key on <input> tag will cause loose of focus.
   * @param {Calculator} calculator   
   */
  Keyboard.startKeyboardProcessing = function(calculator) {
    
    var windList = calculator.windList, 
        path = calculator.path;
    
    //  Change Wind by keyboard.
    $("html").keydown(function(e) {
   
      var angle = windList.currentWind.getAngle(),
          value = windList.currentWind.getValue();
          
      var key = e.which;
      switch(key) {
        case 39:
          angle += 5;
          windList.setCurrentAngle(angle);
          windList.printCurrentWindWindow();
          calculatePrintRresults();           
          break;
        case 37:
          angle -= 5;
          windList.setCurrentAngle(angle);
          windList.printCurrentWindWindow();
          calculatePrintRresults();          
          break;
        case 38:
          if (value <= Constant.maxWindValue - 1) {
            value++;            
            windList.setCurrentValue(value);
            windList.printCurrentWindWindow();
            calculatePrintRresults();
          }           
          break;
        case 40:
          if (value >= 1) {
            value--;
            windList.setCurrentValue(value);
            windList.printCurrentWindWindow();            
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
        path.printHeightsAndWindPoints();
      }                   
    }
  }
    
  provide(Keyboard);  
}); 