ymaps.modules.define('DialogWindows', [
  'Output'
],
function(
  provide, 
  Output  
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
    defaultZoom,     
    map, 
    arrow, 
    path, 
    heightOutput, 
    windOutput, 
    calculator, 
    chute, 
    wind
  ) {

    initHeightOutputWindow();
    initSettingsWindow();
    initChuteWindow();
    initWindWindow();
    
    
    function initHeightOutputWindow() {
      heightOutput.print([calculator.getStartHeight()]);      
    }
    
   
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
        map.setCenter(mapCenter, defaultZoom); 
        arrow.geometry.setCoordinates(mapCenter);
        path.clear();
        heightOutput.print([calculator.getStartHeight()]);
      });
      
      $("#startHeight").val(calculator.getStartHeight());
      $("#startHeight").prop("disabled", !path.getPathDirection());
                        
      $("#startHeight").change(function () {       
        var s = $(this).val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= 4000)) {
          calculator.setStartHeight(n);      
        }
        //$(this).val(calculator.getStartHeight());
   
        calculator.calculateHeight();   
        Output.print(calculator, heightOutput, path);   
   
        //printHeight(calculator.calculateHeight());
        //$("#finalHeight").val(Math.floor(calculator.getFinalHeight()));        
      });

      
      $("#finalHeight").val(calculator.getFinalHeight()); 
      $("#finalHeight").prop("disabled", path.getPathDirection());
      
      $("#finalHeight").change(function () {       
        var s = $(this).val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= 4000)) {
          calculator.setFinalHeight(n);      
        }
        //$(this).val(calculator.getFinalHeight());
        
        
        calculator.calculateHeight();   
        Output.print(calculator, heightOutput, path);           
   
        //printHeight(calculator.calculateHeight());
        //$("#startHeight").val(Math.floor(calculator.getStartHeight()));        
      });

      
      $("#pathDirection").change(function() {
        var isChecked = $(this).prop("checked");
        //console.log(!isChecked);        
        //calculator.setPathDirection(!isChecked);
        path.pathDirection = !isChecked;

        //path.clear();
        
        if (isChecked) {  // Reverse path direction
          $("#finalHeight").prop("disabled", false);
          $("#startHeight").prop("disabled", true);
          //$("#startHeight").val(0);
          //calculator.setStartHeight(0);
          //heightOutput.print([0]);
        } else {  // Direct path direction
          $("#finalHeight").prop("disabled", true);
          $("#startHeight").prop("disabled", false);
        
          //$("#startHeight").val(300);
          //calculator.setStartHeight(300);
          //heightOutput.print([300]);
        } 
        
        //printHeight(calculator.calculateHeight());         
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
        if ((chutehorvel>=0) && (chutehorvel<=25)) {
          chute.horizontalVel = chutehorvel;
        }
        $("chutehorvel").val(chute.horizontalVel);
              
        var chutevervel = Number.parseFloat($("#chutevervel").val());
        if (( chutevervel>=0) && (chutevervel<=50)) {
          chute.verticalVel = chutevervel;    
        } 
        $("#chutevervel").val(chute.verticalVel);        

        calculator.calculateHeight();   
        Output.print(calculator, heightOutput, path);    
        
        //printHeight(calculator.calculateHeight());
      });
    }    

    /** 
     * Wind Window initialization.
     */    
    function initWindWindow() {
      // Set default value      
      $("#windDirectionInput").val(wind.angle);
      $("#windValueInput").val(wind.value);
            
      // Change Wind Direction in Wind Window.  
      $("#windDirectionInput").on('input change', function() {
        var angleStr = $("#windDirectionInput").val();          
        var angle = Number.parseInt(angleStr);
        arrow.rotate(angle);
        wind.angle = angle;

        
        calculator.calculateHeight();   
        Output.print(calculator, heightOutput, path);
        windOutput.print(wind);        
        
        
        //var height = calculator.calculateHeight();            
        //printWindHeight(wind, height);      
      });

      // Change Wind Value in Wind Window.   
      $("#windValueInput").on('input change', function() {
        var valueStr = $("#windValueInput").val();
        var value = Number.parseInt(valueStr);    
        wind.value = value;
        
        
        calculator.calculateHeight();   
        Output.print(calculator, heightOutput, path);
        windOutput.print(wind);        

       
        //var height = calculator.calculateHeight();       
        //printWindHeight(wind, height);
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
      var maxWindVelocity = 10;
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

    /**
     * Print heights in placemarks of path vertices and 
     * in Height output element.
     * @param {number[]} height - Array of heights at path vertices.
     */  /*   
    function printHeight(height) {
      path.printHeightHints(height);       
      heightOutput.print(height);       
    }  */

    /**
     * Print heights in placemarks of path vertices and 
     * in Height output element.
     * Print Wind direction and value in Wind output element.
     * @param {Wind} wind
     * @param {number[]} height - Array of heights at path vertices.
     */    /* 
    function printWindHeight(wind, height) {
      windOutput.print(wind);
      path.printHeightHints(height);       
      heightOutput.print(height)
    }    */        
  }

  provide(DialogWindows);  
});  