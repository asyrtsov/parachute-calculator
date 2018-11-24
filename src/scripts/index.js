/** 
 * Program calculate height of Chute for 
 * given point on the Path. Path is a set of line segments. 
 * You can input Path by clicking left mouse button.
 */
 
 
// Determine mobile or desktop cases.
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
  
  map.setType("yandex#satellite");  // view from space    
  map.cursors.push('arrow');  
  map.controls.remove('trafficControl');  
  map.controls.remove('zoomControl');
  var zoomControl = new ymaps.control.ZoomControl({options: { 
    position: { right: 10, top: 105 }, 
    size: 'small'
  }}); 
  map.controls.add(zoomControl);
  map.controls.remove('geolocationControl');
  map.controls.remove('fullscreenControl');   
   
  var searchControl = map.controls.get('searchControl');
  searchControl.options.set('size', 'small');
  searchControl.options.set('noPlacemark', true);
  searchControl.options.set('noSelect', true);
  
  
  ymaps.modules.require([
    'Wind', 
    'Chute',
    'Path',    
    'Calculator', 
    'Arrow'
  ]).spread(function (

    Wind, 
    Chute,
    Path,      
    Calculator, 
    Arrow
  ) {
    
    var wind = new Wind(5, 0);     // West wind, 5 m/sec      
    var chute = new Chute(10, 5);  // Chute velocity = (10, 5) m/s
    var path = new Path(map, isMobile); 
    
    var startHeight = 300;   // meters
    
    var calculator = new Calculator(path, wind, chute, startHeight);      

    
    // Height output 
    var heightOutput = createOutputControlElement();      
    heightOutput.print = function(height) {
      if (height.length > 0) {      
        if ((height.length == path.length) || 
            (path.length == 0)) {               
          heightOutput.data.set("content", 
                                "Высота: " + Math.floor(height[height.length - 1]) + " м");
        } else {                               
          heightOutput.data.set("content", "Невозможно!");
        }
      }      
    }
    
    heightOutput.print([startHeight]);        
    map.controls.add(heightOutput, {float: 'left'});
    
    map.events.add("click", function(e) {
      var point = e.get('coords');
      
      var lastVertex = path.addVertex(point);
           
      lastVertex.events.add('dblclick', function(e) {
        e.stopPropagation();  // remove standart zoom for double click
        path.removeVertex(lastVertex);
        var height = calculator.calculateHeight();
        path.printHeightHints(height);       
        heightOutput.print(height);             
      });
            
      var height = calculator.calculateHeight();
      path.printHeightHints(height);       
      heightOutput.print(height);        
    });      
            
    // Wind output  
    var windOutput = createOutputControlElement();
    windOutput.print = function(wind) {        
      this.data.set("content", "Ветер: " + 
        wind.value + " м/с, " + wind.getDirection());        
    }
    windOutput.print(wind);
    map.controls.add(windOutput, {float: 'left'}); 
    
    // Windsock creation
    var arrow = new Arrow(map.getCenter(), isMobile);        
    map.geoObjects.add(arrow);      
    map.events.add('boundschange', function (e) {
      var newZoom = e.get('newZoom'),
            oldZoom = e.get('oldZoom');
      if (newZoom != oldZoom) {
        arrow.changeSize(newZoom);
      }
    });
    
      
    // Only one button can be pressed at once
    // pressedButton is currently pressed button
    var pressedButton = null;
    
    // Clear Button
    var clearButton = createButtonControlElement("Очистить", "images/icon_eraser.svg");
    clearButton.events.add("click", function() {
      path.clear();
      heightOutput.print([startHeight]);
    });
    
    // DzStartHeight Button
    var dzHeightButton = createButtonControlElement("Настройки", "images/icon_settings.svg");
    connectButtonToWindow(dzHeightButton, "#dzHeightMenu");  

    // DzStartHeight Window initialization 
    for(var i=0; i<dz.length; i++) {
      $("#dz").append("<option>" + dz[i].name + "</option>");    
    }  
    $("#dz").on("change", function() {
      var mapCenter = dz[this.selectedIndex].mapCenter;      
      map.setCenter(mapCenter, defaultZoom); 
      arrow.geometry.setCoordinates(mapCenter);
      path.clear();
      heightOutput.print([startHeight]);
    });
    
    $("#startHeight").val(startHeight); 
    
    $("#startHeight").on("change", function () {       
      var s = $("#startHeight").val();
      var n = Number.parseFloat(s);
      if ((n >= 4) && (n <= 4000)) {
        startHeight = n;      
      }
      $("#startHeight").val(startHeight);

      calculator.setStartHeight(startHeight);      
      printHeight(calculator.calculateHeight());            
    });  
        
    // Chute Button
    var chuteButton = createButtonControlElement("Настройки парашюта", "images/icon_chute.svg");
    connectButtonToWindow(chuteButton, "#chuteMenu");

    // Chute menu initialization
    $("#chutehorvel").val(chute.horizontalVel);
    $("#chutevervel").val(chute.verticalVel);

    /**
     * Change Chute velocity in Chute Window.
     */     
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
      
      printHeight(calculator.calculateHeight());
    }); 
        
    // Help Button
    var helpButton = createButtonControlElement("Справка", "images/icon_help.svg");
    connectButtonToWindow(helpButton, "#helpMenu");

    // Wind Button
    var windButton = createButtonControlElement("Настройка ветра", "images/icon_arrow.svg");  
    connectButtonToWindow(windButton, "#windMenu");

    // Draw scales for Wind Window    
    drawWindScales(); 
      
    $("#windDirectionInput").val(wind.angle);
    $("#windValueInput").val(wind.value);
    
    /**
     * Change Wind Direction in Wind Window.
     */    
    $("#windDirectionInput").on('input change', function() {
      var angleStr = $("#windDirectionInput").val();          
      var angle = Number.parseInt(angleStr);
      arrow.rotate(angle);
      wind.angle = angle;
      var height = calculator.calculateHeight();            
      printWindHeight(wind, height);      
    });

    /**
     * Change Wind Value in Wind Window.
     */     
    $("#windValueInput").on('input change', function() {
      var valueStr = $("#windValueInput").val();
      var value = Number.parseInt(valueStr);    
      wind.value = value;
      var height = calculator.calculateHeight();       
      printWindHeight(wind, height);
    });

    
    // To loose focus after pressing Enter on <input>
    // This is for dzHeightMenu and chuteMenu  
    $("input").keypress(function(e) {
      if (e.keyCode === 13) {  // Enter keycode
        $("input").blur();     // Forced loose of focus
      }    
    });    
    
    
    /**
     * Change Wind by keyboard.
     */
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

    // Adding Buttons to Map.  
    map.controls.add(dzHeightButton, {position: {top: 45, left: 10}});
    map.controls.add(chuteButton, {position: {top: 75, left: 10}});
    map.controls.add(windButton, {position: {top: 105, left: 10}});
    map.controls.add(helpButton, {position: {top: 135, left: 10}});   
    map.controls.add(clearButton, {position: {top: 165, left: 10}});


    searchControl.events.add('resultshow', function(e) {
      path.clear();
      heightOutput.print([startHeight]);
     
      map.setZoom(defaultZoom);

      arrow.geometry.setCoordinates(map.getCenter());
       
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

    
    /**
     * Template for Output Windows.
     * @param {string} content - output data.
     * @return {ymaps.control.Button} outputElement       
     */
    function createOutputControlElement(content = '') {
      
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

    function printHeight(height) {
      path.printHeightHints(height);       
      heightOutput.print(height);       
    }    
        
    function printWindHeight(wind, height) {
      windOutput.print(wind);
      path.printHeightHints(height);       
      heightOutput.print(height)
    }  


    /**
     * Template for Menu Buttons.
     * @param {string} title - button hint.
     * @param {string} image - button icon.
     * @param {string} cssclass - button css.     
     * @return {ymaps.control.Button} inputElement       
     */    
    function createButtonControlElement(title='', 
                                        image='', 
                                        cssclass='inputControlElement') {
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


    /**
     * Connect Menu Buttons to Output Html Windows:
     *   when you press the button, the window will be shown, 
     *   when you press again - it will disapear.
     * @param {ymaps.control.Button} currentButton
     * @param {string} windowjQuerySelector - jQuery selector for Window.
     */
    function connectButtonToWindow(currentButton, windowjQuerySelector) {
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
    
    /**
     * Auxiliary function for connectButtonToWindow function. 
     * It responds for turning off button and corresponding window.
     */     
    function turnOffButton(turningOffButton) {
      $(turningOffButton.windowjQuerySelector).hide();
      turningOffButton.windowIsOn = false;
      turningOffButton.data.set('cssclass', 'inputControlElement');
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
  
  });      
}