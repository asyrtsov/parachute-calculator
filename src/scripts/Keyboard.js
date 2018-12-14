ymaps.modules.define('Keyboard', [],
function(provide) {

  var Keyboard = {};
  
  /**
   * Keys: left, right, up, down are for changing wind (arrow) direction
   * and wind value.
   * Enter key on <input> tag will cause loose of focus.
   * @param {Wind} wind
   * @param {Arrow} arrow
   * @param {Calculator} calculator
   * @param {WindOutputElement} windOutput
   * @param {HeightOutputElement} heightOutput
   * @param {Path} path   
   */
  Keyboard.startKeyboardProcessing = function(
    wind, 
    arrow, 
    calculator, 
    windOutput, 
    heightOutput, 
    path
  ) {
    
    //  Change Wind by keyboard.
    $("html").keydown(function(e) { 
      var key = e.which;
      switch(key) {
        case 39: 
          wind.angle += 5;
          if (wind.angle > 180) { 
            wind.angle = -180 + (wind.angle - 180);
          }  
          arrow.rotate(wind.angle);
          $("#windDirectionInput").val(wind.angle);
          var height = calculator.calculateHeight(); 
          printWindHeight(wind, height);             
          break;
        case 37: 
          wind.angle -= 5;
          if (wind.angle < -180) {
            wind.angle = 180 - (-180 - wind.angle);
          }  
          arrow.rotate(wind.angle);
          $("#windDirectionInput").val(wind.angle);
          var height = calculator.calculateHeight(); 
          printWindHeight(wind, height);            
          break;
        case 38: 
          wind.value++;
          if (wind.value > 10) wind.value = 10;
          $("#windValueInput").val(wind.value);
          var height = calculator.calculateHeight(); 
          printWindHeight(wind, height);            
          break;
        case 40: 
          wind.value--;
          if (wind.value < 0) wind.value = 0;
          $("#windValueInput").val(wind.value);
          var height = calculator.calculateHeight(); 
          printWindHeight(wind, height);            
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

    function printWindHeight(wind, height) {
      windOutput.print(wind);
      path.printHeightHints(height);       
      heightOutput.print(height)
    }   
  }
    
  provide(Keyboard);  
}); 