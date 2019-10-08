ymaps.modules.define('DialogWindows', ['Constant'],
function(provide, Constant) {

  var DialogWindows = {};
  /**
   * @param {Calculator} calculator
   */
  DialogWindows.initMenu = function(calculator) {
    
    var path = calculator.path;
        chute = calculator.chute;
        windList = calculator.windList;
        boundaryHeights = calculator.boundaryHeights;    
    var map = path.map;    


    initMenuWindow();
    initDzWindow();
    initChuteWindow();
    initPathWindow();
    initHeightWindow();
    initWindWindow();

    
    // First active link in Menu will be Dz link
    var prevLinkId = 'dzLink';

    /**
     * Settings Menu initialization
     */
    function initMenuWindow() {

      $('#dzLinkContent').css('display', 'block');
      $('#dzLink').addClass('active');

      $('nav a').on('click', function(e) {
        e.preventDefault();

        let currentLinkId = $(this).attr('id');

        $('#' + prevLinkId + "Content").css('display', 'none');
        $('#' + currentLinkId + "Content").css('display', 'block');

        $('#' + prevLinkId).removeClass('active');
        $(this).addClass('active');
            
        prevLinkId = currentLinkId;
      })


      // Close Settings Menu after clicking Cross or Dark screen
      $("#settingsMenuHeaderRectangle, #settingsMenuDarkScreenClickable").click(function() {
        
        $("#settingsMenuDarkScreen").css("left", "-100%");

        if (window.matchMedia("(min-width: 768px)").matches) {
          $("#settingsMenu").css("left", "-50%");  
        } else {
          $("#settingsMenu").css("left", "-100%");              
        }
      });   

    }

  
    /**
     * Dz Window initialization
     */
    function initDzWindow() {
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
     * Path Window initialization.
     */  
    function initPathWindow() {            
      $("#pathDirection").change(function() {
        var isChecked = $(this).prop("checked");
        path.setPathDirection(!isChecked);                
      }); 
    }    
              
    
    /**
     * This function is empty.
     * All work is made in BoudaryHeights class.
     * In the future that part of BoundaryHeights class 
     * should be transpose to this function. 
     */
    function initHeightWindow() {
    }



    /** 
     * Wind Window initialization.
     */    
    function initWindWindow() {

      drawWindTable();

      $("#windInputHeaderArrowRectangle").click(function() {
        drawWindTable();
        $("#windInput").addClass("displayNone");
        $("#windScreen").removeClass("displayNone");
      });


      $("#addWind").click(function() {
        
      });


      /**
       * Draw Wind Table in Wind Menu
       */
      function drawWindTable() {
        var windTable = document.getElementById("windTable"); 
        windTable.innerHTML = '';  
        var wind = windList.firstWind;
        for(var i=0;; i++) {
          var row = windTable.insertRow(i);
          row.addEventListener("click", function() {
            $("#windScreen").addClass("displayNone");
            $("#windInput").removeClass("displayNone");
          });
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          cell1.innerHTML = wind.height + "м";
          cell2.innerHTML = wind.angle;
          cell3.innerHTML = wind.value + "м/c";
          wind = wind.nextWind;
          if (wind == null) break;
        } 
      }

      
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
      
      /*
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
      }         */   

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