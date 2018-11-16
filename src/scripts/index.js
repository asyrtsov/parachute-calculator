/** 
 * Program calculate height of Chute for 
 * given point on the Path. Path is a set of line segments. 
 * You can input Path by clicking left mouse button.
 */
 
// Determine mobile or desktop cases
var isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { 
  isMobile = true;
}

      
ymaps.ready(init);  
function init() { 

  var dz = [
    {name: "Коломна", mapCenter: [55.091289443603706, 38.917269584802675]}, 
    {name: "Пущино", mapCenter: [54.78929269708931,37.64268598670033]}, 
    {name: "Ватулино", mapCenter: [55.663193308717396,36.14121807608322]}
  ]; 

  var defaultZoom = 16;  
  var map = new ymaps.Map("map", {
      center: dz[0].mapCenter,    
      zoom: defaultZoom
    },
    {
      suppressMapOpenBlock: true  // remove button 'open in yandex maps'
    }    
  );
  
 
  ymaps.modules.require(['Arrow', 'Wind', 'Chute', 'Flight'])
    .spread(function (Arrow, Wind, Chute, Flight) {
            
      map.setType("yandex#satellite");  // sputnik view    
      map.cursors.push('arrow');  
      map.controls.remove('trafficControl');  
      map.controls.remove('zoomControl');
      var zoomControl = new ymaps.control.ZoomControl({options: { 
        position: { right: 10, top: 105 }, 
        size: 'small'
      }}); 
      map.controls.add(zoomControl); 

      var searchControl = map.controls.get('searchControl');
      searchControl.options.set('size', 'small');
      searchControl.options.set('noPlacemark', true);
      searchControl.options.set('noSelect', true);  
      searchControl.events.add('resultshow', function(e) {
        if (typeof flight !== 'undefined') {
          // variable 'flight' will be defined later
          flight.clear();
          heightOutput.print(flight);
        }  
        map.setZoom(defaultZoom);
        if (typeof arrow !== 'undefined') {
          arrow.geometry.setCoordinates(map.getCenter());
        }  
        var index = e.get('index');    
        var geoObjectsArray = searchControl.getResultsArray();
        var resultName = geoObjectsArray[index].properties.get('name');

        var newDz = {
          name: resultName, 
          mapCenter: map.getCenter()
        };    
        dz.push(newDz);    
        $("#dz").append("<option>" + newDz.name + "</option>");    
        $("#dz").children()[dz.length - 1].selected = true;    
      });
      
      map.controls.remove('geolocationControl');
      map.controls.remove('fullscreenControl'); 
      
      // Template for App Output Elements (Wind and Height)
      function createOutputControlElement(content = '') {
        // Yandex Maps Control Element 
        // for some values output
        
        var outputElement = new ymaps.control.Button({
          data: {content: content},  
            
          options: {
            layout: ymaps.templateLayoutFactory.createClass(
              "<div class='outputControlElement'>{{data.content}}</div>"
            ),
           maxWidth: 300 
          }
        });      
        return outputElement;
      }
     
      // Height output 
      var heightOutput = createOutputControlElement();
      
      heightOutput.print = function(flight) {      
        if (flight.getFlightIsPossible) {               
          heightOutput.data.set("content", 
                                "Высота: " + Math.floor(flight.finalHeight) + " м");
        } else {                               
          heightOutput.data.set("content", "Невозможно!");
        }                   
      }
      
      map.controls.add(heightOutput, {float: 'left'});
      
      
      // Wind output  
      var windOutput = createOutputControlElement();

      windOutput.print = function(wind) {        
        this.data.set("content", "Ветер: " + 
          wind.value + " м/с, " + wind.getDirection());        
      }

      map.controls.add(windOutput, {float: 'left'}); 
      
      function printWindHeight(wind, flight) {
        windOutput.print(wind);
        flight.setWind(wind);
        heightOutput.print(flight);
      }  
      
      
      var arrow = new Arrow(map.getCenter(), isMobile);        
      map.geoObjects.add(arrow);      
      map.events.add('boundschange', function (e) {
        var newZoom = e.get('newZoom'),
              oldZoom = e.get('oldZoom');
        if (newZoom != oldZoom) {
          arrow.changeSize(newZoom);
        }
      });
      
       
      var wind = new Wind(5, 0);     // West wind, 5 m/sec
      windOutput.print(wind);
      
      var chute = new Chute(10, 5);  // in meters      
      var startHeight = 300;         // in meters
            
      var flight = new Flight(map, wind, chute, startHeight, isMobile);
      heightOutput.print(flight);      
      map.events.add("click", function(e) {
        var point = e.get('coords'); 
        flight.addVertex(point);
        heightOutput.print(flight);        
      });
      
 
      // Template for App (Yandex.maps) buttons
      function createButtonControlElement(title='', 
                                          image='', 
                                          cssclass='inputControlElement') {
        // Yandex Maps Control Element 
        // for some value input 
        var inputElement = new ymaps.control.Button({
          data: {
            title: title,
            image: image, 
            cssclass: cssclass        
          },  
          options: {
            layout: ymaps.templateLayoutFactory.createClass(
              "<div title='{{data.title}}' class='{{data.cssclass}}'>" + 
                "<img class='iconimage' src='{{data.image}}'>" +           
              "</div>"
            ),
            maxWidth: 300
          }
        });      
        return inputElement;
      }   
      

      // Only one button can be pressed at once
      // pressedButton is currently pressed button
      var pressedButton = null;
      
      // Connect Yandex.maps buttons to windows (html elements)
      function connectButtonToWindow(currentButton, windowjQuerySelector) {
        // currentButton is Yandex maps api Button Control Element, 
        // windowjQuerySelector (string) is a jQuery selector for window
        currentButton.windowIsOn = false;
        currentButton.windowjQuerySelector = windowjQuerySelector;  
        
        currentButton.events.add("click", function() {
          currentButton.windowIsOn = !currentButton.windowIsOn;
          if (currentButton.windowIsOn) {
            $(windowjQuerySelector).show();      
            arrow.geometry.setCoordinates(map.getCenter());
            currentButton.data.set('cssclass', 'pressedInputControlElement');

            if ((pressedButton != null) && (pressedButton != currentButton)) {
              turnOffButton(pressedButton);
            }
            pressedButton = currentButton;        
          } else {
            turnOffButton(currentButton);
            pressedButton = null;        
          }   
        });
            
        // Cross closing of window element
        $(windowjQuerySelector + "Rectangle").click(function() {
          turnOffButton(currentButton);  
          pressedButton = null;      
        });
      }
      
      // Auxiliary function for connectButtonToWindow function. 
      // It responds for turning off button and corresponding window  
      function turnOffButton(turningOffButton) {
        $(turningOffButton.windowjQuerySelector).hide();
        turningOffButton.windowIsOn = false;
        turningOffButton.data.set('cssclass', 'inputControlElement');
      }   

      
      // Clear Button
      var clearButton = createButtonControlElement("Очистить", "images/icon_eraser.svg");
      clearButton.events.add("click", function() {
        flight.clear();
        heightOutput.print(flight);
      });

      
      // Dz and Start Height Button
      var dzHeightButton = createButtonControlElement("Настройки", "images/icon_settings.svg");
      connectButtonToWindow(dzHeightButton, "#dzHeightMenu");  

      // Dz and Start Height menu initialization 
      for(var i=0; i<dz.length; i++) {
        $("#dz").append("<option>" + dz[i].name + "</option>");    
      }  
      $("#dz").on("change", function() {
        var mapCenter = dz[this.selectedIndex].mapCenter;      
        map.setCenter(mapCenter, defaultZoom); 
        arrow.geometry.setCoordinates(mapCenter);
        flight.clear();
        heightOutput.print(flight);
      });
      
      $("#startHeight").val(startHeight); 
      
      $("#startHeight").on("change", function () {       
        var s = $("#startHeight").val();
        var n = Number.parseFloat(s);
        if ((n >= 4) && (n <= 4000)) {
          startHeight = n;      
        }
        $("#startHeight").val(startHeight);
        flight.setStartHeight(startHeight);         
        heightOutput.print(flight);
      });  
      
      
      // Chute Button
      var chuteButton = createButtonControlElement("Настройки парашюта", "images/icon_chute.svg");
      connectButtonToWindow(chuteButton, "#chuteMenu");

      // Chute menu initialization
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
        flight.setChute(chute);        
        heightOutput.print(flight);
      }); 
      
      
      // Help Button
      var helpButton = createButtonControlElement("Справка", "images/icon_help.svg");
      connectButtonToWindow(helpButton, "#helpMenu");

      
      // Wind Button
      var windButton = createButtonControlElement("Настройка ветра", "images/icon_arrow.svg");  
      connectButtonToWindow(windButton, "#windMenu");

      // Wind menu initialization
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
      drawWindScales(); 
        
      $("#windDirectionInput").val(wind.angle);
      $("#windValueInput").val(wind.value);
      
      $("#windDirectionInput").on('input change', function() {
        var angleStr = $("#windDirectionInput").val();          
        var angle = Number.parseInt(angleStr);
        arrow.rotate(angle);
        wind.angle = angle;
        printWindHeight(wind, flight);
      });
      
      $("#windValueInput").on('input change', function() {
        var valueStr = $("#windValueInput").val();
        var value = Number.parseInt(valueStr);    
        wind.value = value;     
        printWindHeight(wind, flight);
      });

      
      // To loose focus after pressing Enter on <input>
      // This is for dzHeightMenu and chuteMenu  
      $("input").keypress(function(e) {
        if (e.keyCode === 13) {  // Enter keycode
          $("input").blur();  // Forced loose of focus
        }    
      });    
      
      
      // Change Wind by keyboard
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
            printWindHeight(wind, flight);             
            break;
          case 37: 
            wind.angle -= 5;
            if (wind.angle < -180) {
              wind.angle = 180 - (-180 - wind.angle);
            }  
            arrow.rotate(wind.angle);
            $("#windDirectionInput").val(wind.angle);
            printWindHeight(wind, flight);            
            break;
          case 38: 
            wind.value++;
            if (wind.value > 10) wind.value = 10;
            $("#windValueInput").val(wind.value);
            printWindHeight(wind, flight);            
            break;
          case 40: 
            wind.value--;
            if (wind.value < 0) wind.value = 0;
            $("#windValueInput").val(wind.value);
            printWindHeight(wind, flight);            
            break;
        }              
      });   

      // Adding Buttons to Map.  
      map.controls.add(dzHeightButton, {position: {top: 45, left: 10}});
      map.controls.add(chuteButton, {position: {top: 75, left: 10}});
      map.controls.add(windButton, {position: {top: 105, left: 10}});
      map.controls.add(helpButton, {position: {top: 135, left: 10}});   
      map.controls.add(clearButton, {position: {top: 165, left: 10}});  
  });      
}