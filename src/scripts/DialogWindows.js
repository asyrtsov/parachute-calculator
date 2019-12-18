ymaps.modules.define('DialogWindows', ['Constant', 'Wind'],
function(provide, Constant, Wind) {

  var DialogWindows = {};
  /**
   * @param {AppMap} map
   * @param {Chute} chute
   * @param {WindList} windList
   * @param {Path} path
   * @param {Calculator} calculator 
   */
  DialogWindows.initMenu = function(map, chute, windList, path, calculator) {
    
    // First active link in Menu will be Dz link  
    this.prevLinkId = 'helpLink';

    initMenuWindow();
    initDzWindow();
    initChuteWindow();
    initHeightWindow();
    initWindWindow();
    
    /**
     * Settings Menu initialization
     */
    function initMenuWindow() {

      $('#helpLinkContent').css('display', 'block');
      $('#helpLink').addClass('active');

      $('nav a').on('click', function(e) {
        e.preventDefault();

        let currentLinkId = $(this).attr('id');

        $('#' + DialogWindows.prevLinkId + "Content").css('display', 'none');
        $('#' + currentLinkId + "Content").css('display', 'block');

        $('#' + DialogWindows.prevLinkId).removeClass('active');
        $(this).addClass('active');
            
        DialogWindows.prevLinkId = currentLinkId;
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

      // Loose focus after pressing Enter on input field.
      $("input").keypress(function(e) {
        if (e.keyCode === 13 || e.keyCode === 9) {  // Enter keycode
          $("input").blur();     // Forced loose of focus
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
        map.arrow.setCoordinates(mapCenter);                
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
    
      $("#chutehorvel").on("change", function () {
        var chutehorvel = Number.parseFloat($("#chutehorvel").val());
        if ((chutehorvel>=0) && (chutehorvel<=Constant.maxChuteHorizontalVelocity)) {
          chute.horizontalVel = chutehorvel;
          $("#chutehorvel").val(chutehorvel);
        } else {
          if (Number.isNaN(chutehorvel)) {
            alert('Недопустимое значение!');
          } else {
            if (chutehorvel < 0) {
              alert('Скорость должна быть неотрицательной!');
            } else {
              alert('Скорость должна быть не больше ' + Constant.maxChuteHorizontalVelocity + 'м/с !');
            }
          }
          $("#chutehorvel").val(chute.horizontalVel);
          return;           
        }

        if (path.length > 0) {
          calculator.calculateHeight();           
        }        
      });  

      $("#chutevervel").on("change", function () {                           
        var chutevervel = Number.parseFloat($("#chutevervel").val());
        if (( chutevervel>=0) && (chutevervel<=Constant.maxChuteVerticalVelocity)) {
          chute.verticalVel = chutevervel;
          $("#chutevervel").val(chutevervel);    
        } else {
          if (Number.isNaN(chutevervel)) {
            alert('Недопустимое значение!');
          } else {
            if (chutevervel < 0) {
              alert('Скорость должна быть неотрицательной!');
            } else {
              alert('Скорость должна быть не больше ' + Constant.maxChuteVerticalVelocity + 'м/с !');
            }
          }
          $("#chutevervel").val(chute.verticalVel);
          return;           
        }
                
        if (path.length > 0) {
          calculator.calculateHeight();           
        }
      });
    }    

    
    /**
     * Height Window initialization.
     */
    function initHeightWindow() {
      $("#baseVertexHeight").val(Math.floor(Constant.defaultBaseHeight));

      $("#baseVertexHeight").on("change", function() {            
        var n = Number.parseFloat($("#baseVertexHeight").val());
        
        if ((n >= 0) && (n <= Constant.maxHeight)) { 
            path.setBaseVertexHeight(n);
            $("#baseVertexHeight").val(Math.floor(n));                  
        } else {

          if (Number.isNaN(n)) {
            alert('Недопустимое значение!');
          } else {
            if (n < 0) {
              alert('Высота в базовой точке должна быть неотрицательной!');
            } else {
              alert('Высота в базовой точке должна быть не больше ' + Constant.maxHeight + 'м !');  
            }
          }  
          
          if (path.length > 0) {
            $("#baseVertexHeight").val(Math.floor(path.baseVertex.height));
          } else {
            $("#baseVertexHeight").val(Math.floor(path.baseVertexHeight));  
          } 
        } 
      });
    }



    /** 
     * Wind Window initialization.
     */    
    function initWindWindow() {

      $("#windValueInput").prop("max", "" + Constant.maxWindValue);
      // Draw scales for Range Input Sliders in WindInput window    
      drawWindScales();


      drawWindScreen();

      /**
       * Draw WindScreen window in Wind Menu
       */
      function drawWindScreen() {
        $("#windInput").addClass("displayNone");
        $("#windScreen").removeClass("displayNone");

        var windTable = document.getElementById("windTable"); 
        windTable.innerHTML = '';   
        var funcArray = [];
        var row = []; 
        var wind = windList.firstWind;
        for(var i=0; i < windList.numberOfWinds; i++) {
          row[i] = windTable.insertRow(i);
          funcArray[i] = createRowClickListener(wind);
          row[i].addEventListener("click", funcArray[i]);
          var cell1 = row[i].insertCell(0);
          var cell2 = row[i].insertCell(1);
          var cell3 = row[i].insertCell(2);
          cell1.innerHTML = (wind.height == null)? "?" : wind.height + " м";      
          cell2.innerHTML = '<div class=\"arrow\"></div>';
          cell2.firstChild.style.transform = "rotate(" + (-1)*wind.getAngle() + "deg)";
          cell3.innerHTML = wind.value + " м/c";
          wind = wind.nextWind;
        } 

        // Button Add Wind in WindScreen window
        $("#addWind").click(function() {        
          var w = new Wind(5, 0, null, map);

          $("#addWind").off('click');
          for(var i=0; i < row.length; i++) {
            row[i].removeEventListener('click', funcArray[i]);
          }
          drawWindInput(w);
        });      

        function createRowClickListener(w) {
          return (function(e) {
            $("#windScreen").addClass("displayNone");
            windList.currentWind = w;
            $("#windInput").removeClass("displayNone");

            $("#addWind").off('click');
            for(var i=0; i < row.length; i++) {
              row[i].removeEventListener('click', funcArray[i]);
            }

            drawWindInput(w);    
          }); 
        }
      }
      
      /**
       * Draw WindInput window in Wind Menu
       */
      function drawWindInput(wind) {
        $("#windScreen").addClass("displayNone");
        $("#windInput").removeClass("displayNone");

        if (wind == windList.firstWind) {
          $("#windHeightInput").prop("disabled", true);
          $("#removeWind").addClass("displayNone");       
        } else {
          $("#windHeightInput").prop("disabled", false);
          $("#removeWind").removeClass("displayNone");
        }
        $("#windHeightInput").val(wind.getHeight());    
        $("#windDirectionInput").val(wind.getAngle());
        $("#windValueInput").val(wind.getValue());
        var angle = wind.getAngle();
        $("#menuArrow").css("transform", "rotate(" + (-1)*angle + "deg)");
        $("#menuWindValue").html(wind.getValue() + " м/с");      


        // Button 'Back to WindScreen' in WindInput window
        $("#windInputHeaderArrowRectangle").click(function() { 
          $("#windHeightInput").off("change"); 
          $("#windDirectionInput").off('input change');
          $("#windValueInput").off('input change');
          $("#removeWind").off('click');
          $("#windInputHeaderArrowRectangle").off('click');
          drawWindScreen();
        });

        // Button 'Remove current wind' in WindInput window
        $("#removeWind").click(function() {
          if (wind.getHeight() != null) {
            windList.removeWind(wind);

            if (path.length > 0) {
              calculator.calculateHeight();
            }
          } 
          $("#windHeightInput").off("change"); 
          $("#windDirectionInput").off('input change');
          $("#windValueInput").off('input change');
          $("#removeWind").off('click');
          $("#windInputHeaderArrowRectangle").off('click');
          drawWindScreen();
        });

            
        // Input for WindHeight in WindInput window  
        $("#windHeightInput").on("change", function() {        
          
          var heightString = $("#windHeightInput").val();      
          var height = Number.parseFloat(heightString);

          if (!Number.isNaN(height)) {
            if (height > 0) {
              if (height <= Constant.maxHeight) {
                if (!windList.heightIsInList(height)) {
                  if (wind.height == null) {
                    wind.setHeight(height);
                    windList.addWind(wind);
                  } else {
                    wind.setHeight(height);
                    windList.sortList();
                  }

                  if (path.length > 0) {
                    calculator.calculateHeight();       
                  }                       
                } else {
                  alertError('Такая высота уже была!');
                }
              } else {  // height > Constant.maxHeight
                alertError('Высота должны быть не больше ' + Constant.maxHeight + ' м!');
              }
            } else {  // height <= 0
              if (height == 0) {
                alertError('Поверхностный ветер уже задан!');
              } else {  // height < 0              
                alertError('Высота должна быть больше нуля!');
              }             
            }
          } else {
            alertError('Недопустимое значение!');
          }

          function alertError(str) {
            alert(str);
            $("#windHeightInput").val(Math.floor(wind.height));
          }   
        });
        
                        
        // Range Input Slider for Wind Direction in WindInput window.  
        $("#windDirectionInput").on('input change', function() {
          var angleStr = $("#windDirectionInput").val();          
          var angle = Number.parseInt(angleStr);
          
          wind.setAngle(angle);
          if (wind == windList.firstWind) {
            map.windOutput.print(wind.toString()); 
            map.arrow.rotate(angle);
          }

          $("#menuArrow").css("transform", "rotate(" + (-1)*angle + "deg)");

          if ((wind.height != null) && (path.length > 0)) {
            calculator.calculateHeight();         
          }            
        });

        // Range Input Slider for  Wind Value in WindInput window.   
        $("#windValueInput").on('input change', function() {
          var valueStr = $("#windValueInput").val();
          var value = Number.parseInt(valueStr);

          wind.setValue(value);
          if (wind == windList.firstWind) {
            map.windOutput.print(wind.toString()); 
          } 

          $("#menuWindValue").html(value + " м/с");
          
          if ((wind.height != null) && (path.length > 0)) {
            calculator.calculateHeight();         
          }       
        });
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