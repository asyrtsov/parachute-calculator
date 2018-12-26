ymaps.modules.define('DialogWindows', [
  'Output', 
  'Constant'
],
function(
  provide, 
  Output, 
  Constant  
) {

  var DialogWindows = {};
  /**
   * @param {Object[]} dz
   * @param {string} dz[].name - Name of DZ.
   * @param {number[]} dz[].mapCenter - Coordinates of DZ.
   * @param {number} defaultZoom
   * @param {AppMap} map
   * @param {Path} path
   * @param {HeightOutputElement} heightOutput
   * @param {WindOutputElement} windOutput
   * @param {Calculator} calculator
   * @param {Chute} chute
   * @param {Wind} wind 
   */
  DialogWindows.initializeWindows = function (
    dz,   
    map, 
    arrow, 
    path, 
    heightOutput, 
    windOutput, 
    calculator, 
    chute, 
    wind
  ) {

    initSettingsWindow();
    initChuteWindow();
    initWindWindow();
    
       
    /**
     * Settings (Dz and Start Height Window) initialization:
     *   default options for <input> tags, 
     *   events 'change' for <input> tags.
     */
    function initSettingsWindow() {
      // Set default options: dz array
      for(var i=0; i<dz.length; i++) {
        $("#dz").append("<option>" + dz[i].name + "</option>");    
      }  
      $("#dz").on("change", function() {
        var mapCenter = dz[this.selectedIndex].mapCenter;      
        map.setCenter(mapCenter, Constant.defaultZoom); 
        arrow.geometry.setCoordinates(mapCenter);
        
        // path.clear() will print results too
        path.clear();
      });
      
      $("#startHeight").val(Constant.defaultStartHeight);
                        
      $("#startHeight").change(function () {       
        var s = $(this).val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= Constant.maxHeight)) {
          calculator.setStartHeight(n);      
        }

        Constant.defaultStartHeight = n;
   
        if (path.length > 0) {  
          calculator.calculateHeight();   
          Output.print(calculator, heightOutput, path);   
        } else {
          heightOutput.print(n);
          $("#finalHeight").val(n);                     
        }
     
      });

      
      $("#finalHeight").val(Constant.defaultStartHeight); 
      $("#finalHeight").prop("disabled", true);
      
      $("#finalHeight").change(function () {       
        var s = $(this).val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= Constant.maxHeight)) {
          calculator.setFinalHeight(n);      
        }

        Constant.defaultFinalHeight = n;
        
        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, heightOutput, path);           
        } else {
          heightOutput.print(n);
          $("#startHeight").val(n);                     
        }
       
      });

      
      $("#pathDirection").change(function() {
        var isChecked = $(this).prop("checked");

        path.setPathDirection(!isChecked);
        
        $("#startHeight").prop("disabled", isChecked);
        $("#finalHeight").prop("disabled", !isChecked);

        
        if (path.length > 0) {
          if (path.getPathDirection()) {
            if (calculator.getStartHeight() == null) {
              calculator.setStartHeight(Constant.defaultStartHeight);
            }            
          } else {
            if (calculator.getFinalHeight() == null) {
              calculator.setFinalHeight(Constant.defaultFinalHeight);
            }
          }
          
          calculator.calculateHeight();   
          Output.print(calculator, heightOutput, path);           
        } else { 
          
          var out = path.getPathDirection() ? 
            Constant.defaultStartHeight : Constant.defaultFinalHeight;      
          
          heightOutput.print(out);
          $("#startHeight").val(out);
          $("#finalHeight").val(out);
          calculator.setStartHeight(Constant.defaultStartHeight);
          calculator.setFinalHeight(Constant.defaultFinalHeight);       
        }                                 
      });      
    }    
              
    /** 
     * Chute Window initialization.
     */
    function initChuteWindow() {
      $("#chutehorvel").val(chute.horizontalVel);
      $("#chutevervel").val(chute.verticalVel);
    
      $("#chutehorvel, #chutevervel").on("change", function () {      
        var chutehorvel = Number.parseFloat($("#chutehorvel").val());
        if ((chutehorvel>=0) && (chutehorvel<=Constant.maxChuteHorizontalVelocity)) {
          chute.horizontalVel = chutehorvel;
        }
        $("chutehorvel").val(chute.horizontalVel);
              
        var chutevervel = Number.parseFloat($("#chutevervel").val());
        if (( chutevervel>=0) && (chutevervel<=Constant.maxChuteVerticalVelocity)) {
          chute.verticalVel = chutevervel;    
        } 
        $("#chutevervel").val(chute.verticalVel);        

        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, heightOutput, path);    
        }
      });
    }    

    /** 
     * Wind Window initialization.
     */    
    function initWindWindow() {
      // Set default value      
      $("#windDirectionInput").val(wind.getAngle());

      
      $("#windValueInput").prop("max", "" + Constant.maxWindValue);
      $("#windValueInput").val(wind.getValue());
                  
      // Change Wind Direction in Wind Window.  
      $("#windDirectionInput").on('input change', function() {
        var angleStr = $("#windDirectionInput").val();          
        var angle = Number.parseInt(angleStr);
        arrow.rotate(angle);
        
        wind.setAngle(angle);
        //wind.angle = angle;

        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, heightOutput, path);
        }
        
        windOutput.print(wind);            
      });

      // Change Wind Value in Wind Window.   
      $("#windValueInput").on('input change', function() {
        var valueStr = $("#windValueInput").val();
        var value = Number.parseInt(valueStr);

        wind.setValue(value);
        //wind.value = value;
        
        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, heightOutput, path);
        }
        
        windOutput.print(wind);        
      });
      
      // Draw scales for Wind Window    
      drawWindScales();     
    }
   
    /**
     * Draw scales for Wind Window:
     *   wind direction scale (E, N, W, S, E),
     *   wind velocity scale (0, ..., 10 m/s)
     */
    function drawWindScales() {
      // Create legend for direction range input
      var directionPlateSpan = 5;
      var directionPlateNumber = 4*directionPlateSpan + 1;

      for(var i=0; i<directionPlateNumber; i++) {
        var str = "";
        switch (i) {
          case 0: 
            str = "В";
            break;
          case directionPlateSpan: 
            str = "С";
            break;
          case directionPlateSpan*2: 
            str = "З";
            break;      
          case directionPlateSpan*3: 
            str = "Ю";
            break;
          case directionPlateSpan*4: 
            str = "В";
            break;
          default:
            str = "&nbsp";          
        }
        $("#windDirectionInputScale").append("<div class='directionPlate'>" + str + "</div>");                
      }
      $(".directionPlate").css({
        "width": 100/(directionPlateNumber) + "%",
        "float": "left", 
        "text-align": "center"
      });

      // Create legend for value range input
      var maxWindVelocity = Constant.maxWindValue;
      for(var i=0; i<maxWindVelocity + 1; i++) {    
        $("#windValueInputScale").append("<div class='valueScale' id='v" + i + "'>" + i + "</div>");
      }

      $(".valueScale").css({
        "width": 100/(maxWindVelocity + 0.38) + "%",
        "float": "left",
        "text-align": "left"
      });

      $("#v" + (maxWindVelocity - 1)).css({
        "width": 100/(maxWindVelocity*2) + "%"
      }); 

      $("#v" + maxWindVelocity).css({
        "width": 100/(maxWindVelocity*1.25) + "%",
        "float": "left",
        "text-align": "right"
      });  
    }     
  }

  provide(DialogWindows);  
});  