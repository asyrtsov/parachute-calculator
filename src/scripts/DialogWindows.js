ymaps.modules.define('DialogWindows', ['Constant'],
function(provide, Constant) {

  var DialogWindows = {};
  /**
   * @param {Calculator} calculator
   */
  DialogWindows.initializeWindows = function(calculator) {
    
    var path = calculator.path;
        chute = calculator.chute;
        windList = calculator.windList;
        boundaryHeights = calculator.boundaryHeights;    
    var map = path.map;    
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
        windList.shiftList(mapCenter);                
        // path.clear() will print results too
        path.clear();
      });
            
      $("#pathDirection").change(function() {
        var isChecked = $(this).prop("checked");
        path.setPathDirection(!isChecked);                
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
        $("#chutehorvel").val(chute.horizontalVel);
                     
        var chutevervel = Number.parseFloat($("#chutevervel").val());
        if (( chutevervel>=0) && (chutevervel<=Constant.maxChuteVerticalVelocity)) {
          chute.verticalVel = chutevervel;    
        } 
        $("#chutevervel").val(chute.verticalVel);        

        if (path.length > 0) {
          calculator.calculateHeight();
          path.printHeightsAndWindPoints();              
        }
      });
    }    

    /** 
     * WindList Window initialization.
     */    
    function initWindListWindow() {
      
      $("#windValueInput").prop("max", "" + Constant.maxWindValue);
        
      windList.printCurrentWindWindow();   
                   
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
          path.printHeightsAndWindPoints();          
        }        
      });
      
                       
      // Change Wind Direction in Wind Window.  
      $("#windDirectionInput").on('input change', function() {
        var angleStr = $("#windDirectionInput").val();          
        var angle = Number.parseInt(angleStr);
        
        windList.setCurrentAngle(angle);
        windList.printCurrentWindWindow();

        if (path.length > 0) {
          calculator.calculateHeight();
          path.printHeightsAndWindPoints();           
        }            
      });

      // Change Wind Value in Wind Window.   
      $("#windValueInput").on('input change', function() {
        var valueStr = $("#windValueInput").val();
        var value = Number.parseInt(valueStr);

        windList.setCurrentValue(value);
        windList.printCurrentWindWindow();
        
        if (path.length > 0) {
          calculator.calculateHeight();
          path.printHeightsAndWindPoints();          
        }       
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
        } else {
          $("#windHeightInput").prop("disabled", false);
        }
        $("#windHeightInput").val(windList.currentWind.getHeight());    
        $("#windDirectionInput").val(windList.currentWind.getAngle());
        $("#windValueInput").val(windList.currentWind.getValue());  
        //$("#arrowScale").prop("checked", windList.currentWind.arrow.getIsScaled());        
      }                        
    }
   
    /**
     * Draw scales for Wind Window:
     *   wind direction scale (E, N, W, S, E),
     *   wind velocity scale (0, ..., Constant.maxWindValue m/s)
     */
    function drawWindScales() {
      // Create legend for direction range input
      var directionPlateSpan = 5;
      var directionPlateNumber = 4*directionPlateSpan + 1;
      var windValuePlateNumber = 0;
      
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
    
        var str2;        
        if (i % 5 == 0) {
          str2 = windValuePlateNumber;
          windValuePlateNumber += (Constant.maxWindValue / 4);
        } else {
          str2 = "&nbsp";
        }        
        $("#windValueInputScale").append("<div class='directionPlate'>" + str2 + "</div>");
       
      }
      $(".directionPlate").css({
        "width": 100/(directionPlateNumber) + "%",
        "float": "left", 
        "text-align": "center"
      });     
    }     
  }

  provide(DialogWindows);  
});  