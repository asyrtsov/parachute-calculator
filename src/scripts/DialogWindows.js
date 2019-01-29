ymaps.modules.define('DialogWindows', [
  'Output', 
  'Constant', 
  'Arrow'
],
function(
  provide, 
  Output, 
  Constant, 
  Arrow  
) {

  var DialogWindows = {};
  /**
   * @param {AppMap} map
   * @param {Path} path
   * @param {HeightOutputElement} heightOutput
   * @param {WindOutputElement} windOutput
   * @param {Calculator} calculator
   * @param {Chute} chute
   * @param {Wind} wind 
   */
  DialogWindows.initializeWindows = function (
    map, 
    path, 
    //heightOutput, 
    //windOutput, 
    calculator, 
    chute, 
    windList, 
    boundaryHeights
  ) {
    
    var wind = windList.currentWind;
    

    initSettingsWindow();
    initChuteWindow();
    initWindListWindow();
    
       
    /**
     * Settings (Dz and Start Height Window) initialization:
     *   default options for <input> tags, 
     *   events 'change' for <input> tags.
     */
    function initSettingsWindow() {
      // Set default options: dz array
      for(var i=0; i<map.dz.length; i++) {
        $("#dz").append("<option>" + map.dz[i].name + "</option>");    
      }  
      $("#dz").on("change", function() {
        var mapCenter = map.dz[this.selectedIndex].mapCenter;      
        map.setCenter(mapCenter, Constant.defaultZoom); 
        wind.arrow.setCoordinates(mapCenter);
        //arrow.geometry.setCoordinates(mapCenter);
        
        // path.clear() will print results too
        path.clear();
      });
      
      //$("#startHeight").val(Constant.defaultStartHeight);
      
      $("#startHeight").val(boundaryHeights.startHeight);
                        
      $("#startHeight").change(function () {       
        var s = $(this).val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= Constant.maxHeight)) {
          //calculator.setStartHeight(n);      
          //Constant.defaultStartHeight = n;
          boundaryHeights.startHeight = n;
          $("#startHeight").val(n);  // if value was parsed hardly
     
          if (path.length > 0) {  
            calculator.calculateHeight();   
            Output.print(calculator, path);   
          } else {
            path.heightOutput.print(n);
            boundaryHeights.finalHeight = n;
            $("#finalHeight").val(n);                     
          }
        } else {
          $("#startHeight").val(boundaryHeights.startHeight);
        }
      });

      
      //$("#finalHeight").val(Constant.defaultStartHeight);

      $("#finalHeight").val(boundaryHeights.startHeight);
      
      $("#finalHeight").prop("disabled", true);
      
      $("#finalHeight").change(function () {       
        var s = $(this).val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= Constant.maxHeight)) {
          //calculator.setFinalHeight(n);      
          //Constant.defaultFinalHeight = n;
          boundaryHeights.finalHeight = n;
          $("#finalHeight").val(n);  // if value was parsed hardly
          
          if (path.length > 0) {
            calculator.calculateHeight();   
            Output.print(calculator, path);           
          } else {
            path.heightOutput.print(n);
            boundaryHeights.startHeight = n;
            $("#startHeight").val(n);                     
          }
        } else {
          $("#finalHeight").val(boundaryHeights.finalHeight);
        }    
      });

      
      $("#pathDirection").change(function() {
        var isChecked = $(this).prop("checked");

        path.setPathDirection(!isChecked);
        
        $("#startHeight").prop("disabled", isChecked);
        $("#finalHeight").prop("disabled", !isChecked);

        
        if (path.length > 0) {
          if (path.getPathDirection()) {
            if (boundaryHeights.startHeight == null) {
              //calculator.setStartHeight(Constant.defaultStartHeight);
              boundaryHeights.startHeight = Constant.defaultStartHeight;
            }            
          } else {
            if (boundaryHeights.finalHeight == null) {
              //calculator.setFinalHeight(Constant.defaultFinalHeight);
              boundaryHeights.finalHeight = Constant.defaultFinalHeight;
            }
          }   
          
          calculator.calculateHeight();   
          Output.print(calculator, path);           
        } else { 
          /*
          var out = path.getPathDirection() ? 
            //Constant.defaultStartHeight : Constant.defaultFinalHeight;      
            boundaryHeights.startHeight : boundaryHeights.finalHeight; 
          
          heightOutput.print(out);
          $("#startHeight").val(out);
          $("#finalHeight").val(out);  */
          //calculator.setStartHeight(Constant.defaultStartHeight);
          //calculator.setFinalHeight(Constant.defaultFinalHeight);
          //calculator.setStartHeight(boundaryHeights.startHeight);
          //alculator.setFinalHeight(boundaryHeights.finalHeight);   
          
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
          Output.print(calculator, path);    
        }
      });
    }    

    /** 
     * WindList Window initialization.
     */    
    function initWindListWindow() {
      
      $("#windValueInput").prop("max", "" + Constant.maxWindValue);
        
      windList.printCurrentWindWindow();      
        
      //initWindWindow();
            
      $("#windHeightInput").on("change", function() {        
        // Remember that #windHeightInput is disabled for firstWind
        
        // If we jump to firstWind by use of Tab button (our app has such 
        // possibility), it will call windList.setHeightToCurrentWind (it will be error).
        if (windList.currentWind == windList.firstWind) return;
        
        var s = $("#windHeightInput").val();        
        var n = Number.parseFloat(s);
        
        if ((n > 0) && (n <= Constant.maxHeight)) { 
          if (windList.setHeightToCurrentWind(n)) { 
            $("#windHeightInput").val(n);
          } else {
            var v = windList.currentWind.getHeight();
            var w = (v == null) ? '' : v;             
            $("#windHeightInput").val(w);
            alert("Такая высота уже была!");            
          }            
        } else {
          var v = windList.currentWind.getHeight();
          var w = (v == null) ? '' : v;             
          $("#windHeightInput").val(w);
          alert("Значение не попадает в допустимый интервал!");
        } 
                        
        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, path);
        }        
      });
      
                       
      // Change Wind Direction in Wind Window.  
      $("#windDirectionInput").on('input change', function() {
        var angleStr = $("#windDirectionInput").val();          
        var angle = Number.parseInt(angleStr);
           
        //windList.currentWind.setAngle(angle);
        windList.setCurrentAngle(angle);

        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, path);
        }
        
        //windOutput.print(windList.currentWind);            
      });

      // Change Wind Value in Wind Window.   
      $("#windValueInput").on('input change', function() {
        var valueStr = $("#windValueInput").val();
        var value = Number.parseInt(valueStr);

        //windList.currentWind.setValue(value);
        windList.setCurrentValue(value);
        
        if (path.length > 0) {
          calculator.calculateHeight();   
          Output.print(calculator, path);
        }
        
        //windOutput.print(windList.currentWind);        
      });
      
      // Draw scales for Wind Window    
      drawWindScales();
      
      /*      
      $("#arrowScale").prop("checked", windList.firstWind.arrow.getIsScaled());
      
      $("#arrowScale").change(function() {
        var isChecked = $(this).prop("checked");
        windList.currentWind.arrow.setArrowToBeScaled(isChecked);               
      });   */
      
      
      function initWindWindow() {
        if (windList.currentWind == windList.firstWind) {
          $("#windHeightInput").prop("disabled", true);
         // $("#removeWind").prop("disabled", true);          
        } else {
          $("#windHeightInput").prop("disabled", false);
         // $("#removeWind").prop("disabled", false);
        }
        $("#windHeightInput").val(windList.currentWind.getHeight());    
        $("#windDirectionInput").val(windList.currentWind.getAngle());
        $("#windValueInput").val(windList.currentWind.getValue());  
        $("#arrowScale").prop("checked", windList.currentWind.arrow.getIsScaled());        
      }                        
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
      // For fine view, Constant.maxWindValue should be equals 10
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