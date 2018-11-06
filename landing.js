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
  searchControl.events.add('resultshow', function() {
    map.setZoom(defaultZoom);
    arrow.arrowPlacemark.geometry.setCoordinates(map.getCenter());
    var newDz = {
      name: searchControl.getRequestString(), 
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
  map.controls.add(heightOutput, {float: 'left'});
  // Wind output  
  var windOutput = createOutputControlElement();
  map.controls.add(windOutput, {float: 'left'}); 
  
    
  class Arrow {
    // Yandex Maps Placemark for Wind Arrow
    // CSS for Arrow see in landing.css
    constructor(map) {
      this.map = map;
      
      var arrowStartSize = 25;
      var arrowStartRadius = 10;  // radius of start active area for Arrow
    
      this.arrowPlacemark = new ymaps.Placemark(
        this.map.getCenter(), 
        {
          rotation: 90, 
          size: arrowStartSize
        }, 
        {
          draggable: true,
          iconLayout: ymaps.templateLayoutFactory.createClass(
              '<div class="arrow" style="transform: rotate($[properties.rotation]deg);' + 
              'width: $[properties.size]px; height: $[properties.size]px;"/>'
            ), 
          iconShape: {
            type: 'Circle',
            coordinates: [arrowStartSize/2, arrowStartSize/2],
            radius: arrowStartRadius
          }  
        }
      );

      this.map.geoObjects.add(this.arrowPlacemark); 
         
      this.map.events.add('boundschange', function (e) {
        var newZoom = e.get('newZoom'),
              oldZoom = e.get('oldZoom');
        if (newZoom != oldZoom) {
          
          var size = (2**(newZoom - 16))*arrowStartSize;
          
          var shape = 
            {
              type: 'Circle',
              coordinates: [size/2, size/2],
              radius: (2**(newZoom - 16))*arrowStartRadius
            };
          
          this.arrowPlacemark.options.set('iconShape', shape);      
          this.arrowPlacemark.properties.set('size', size);  
          // properties.set call rebuild of Placemark, 
          // so, properties.set should stay after options.set
        }
      }.bind(this));       
    }
   
    rotate(angle) {
      this.arrowPlacemark.properties.set('rotation', (-1)*angle + 90);      
    }

    /*
    moveTo(point) {  // point = [x, y]
      this.arrowPlacemark.geomentry.setCoordinates(point); 
    }   */ 
  }
  var arrow = new Arrow(map); 

  
  // List of vertices and lines of Path (ymaps.Circle, ymaps.Polyline) 
  // All class methods change map  
  // (because map is object and is copied by link)
  class Path {  
    constructor(map) {
      this.firstVertex = null;
      this.lastVertex = null;
      this.numberOfVertices = 0;
      this.map = map;
      this.vertexRadius = 7;  // in meters
            
      this.addVertex = this.addVertex.bind(this);
      this.removeVertex = this.removeVertex.bind(this);
      this.clear = this.clear.bind(this);    
    }
    
    addVertex(point) {  // point = [x, y], Yandex.Maps coordinates

      var currentVertex = new ymaps.Circle([point, this.vertexRadius]); 
            
      
      currentVertex.events.add('dblclick', function(e) {
        e.stopPropagation();  // remove standart zoom for double click
        var removingVertex = e.get('target');
        this.removeVertex(removingVertex);
      }.bind(this));
            
      if (this.numberOfVertices > 0) {     
        var lastPoint = this.lastVertex.geometry.getCoordinates();
        
        // We remove previous last circle. Add next line. 
        // Add previuos last circle. Add last circle.
        // The reason: lines should be UNDER circles        
        this.map.geoObjects.remove(this.lastVertex);  
        
        this.lastVertex.nextLine = new ymaps.Polyline([lastPoint, point]);
        this.lastVertex.nextVertex = currentVertex;
        
        this.map.geoObjects.add(this.lastVertex.nextLine);   
        this.map.geoObjects.add(this.lastVertex);

        currentVertex.prevVertex = this.lastVertex;
      } else {
        this.firstVertex = currentVertex;
      }

      this.map.geoObjects.add(currentVertex);   
      this.lastVertex = currentVertex;        
      this.numberOfVertices++;      
    }
    
    removeVertex(removingVertex) {      
      //e.stopPropagation();  // remove standart zoom for double click

      //var removingVertex = e.get('target');
      this.map.geoObjects.remove(removingVertex);
      
      var prevVertex = removingVertex.prevVertex;
      var nextVertex = removingVertex.nextVertex;
      
      if (this.numberOfVertices > 1) {
        if ((prevVertex != undefined) && (nextVertex != undefined)) {
          
          var removingLine1 = prevVertex.nextLine;
          var removingLine2 = removingVertex.nextLine;
          
          this.map.geoObjects.remove(removingLine1);
          this.map.geoObjects.remove(removingLine2);
          
          var prevPoint = prevVertex.geometry.getCoordinates();
          var nextPoint = nextVertex.geometry.getCoordinates();
          
          this.map.geoObjects.remove(prevVertex);  // lines should be UNDER circles
          this.map.geoObjects.remove(nextVertex);
          
          var currentLine = new ymaps.Polyline([prevPoint, nextPoint]);
          this.map.geoObjects.add(currentLine);
          
          prevVertex.nextLine = currentLine;
          prevVertex.nextVertex = nextVertex;
          nextVertex.prevVertex = prevVertex;
          
          this.map.geoObjects.add(prevVertex); 
          this.map.geoObjects.add(nextVertex);    
        } else if (nextVertex == undefined) {  // last circle case    
          var removingLine = prevVertex.nextLine;
          map.geoObjects.remove(removingLine);
          this.lastVertex = prevVertex;
          prevVertex.nextVertex = null;
          prevVertex.nextLine = null;      
        } else {  // first circle case
          this.map.geoObjects.remove(removingVertex.nextLine); 
          removingVertex.nextVertex.prevVertex = null;
          this.firstVertex = removingVertex.nextVertex;            
        }
      } else {  // case: only one circle
        this.lastVertex = null;
      }
      
      this.numberOfVertices--;
    }
     
    clear() {
      
      var currentVertex = this.lastVertex;  
      this.map.geoObjects.remove(currentVertex);
      
      for(var i=1; i < this.numberOfVertices; i++) {
        currentVertex = currentVertex.prevVertex; 
        this.map.geoObjects.remove(currentVertex);
        this.map.geoObjects.remove(currentVertex.nextLine);
      }
      
      this.numberOfVertices = 0;
      this.lastVertex = null;  
    }          
  }  

  
  class Chute {
    constructor(horizontalVel, verticalVel) {
      this.horizontalVel = horizontalVel;  // abs value, meters/sec
      this.verticalVel = verticalVel;      // abs value, meters/sec
    }   
  }

    
  class Wind {
    constructor(value, angle) {
      // polar coordinate system: value in m/sec, angle in degree
      this.value = value;
      this.angle = angle;       
    }

    getXY () {      
      var radiandirection = this.angle * ((2*Math.PI)/360);      
      // vector of wind (vx, vy), meters/sec
      var vx = this.value * Math.cos(radiandirection);
      var vy = this.value * Math.sin(radiandirection);
      return [vx, vy];      
    } 
     
    getDirection() {     
      var angleSwitch = Math.floor((this.angle + 180 + 22)/45);
      var direction;
      
      switch(angleSwitch) {
        case 0: direction = "В"; break;
        case 1: direction = "СВ"; break;
        case 2: direction = "С"; break;
        case 3: direction = "СЗ"; break;
        case 4: direction = "З"; break;
        case 5: direction = "ЮЗ"; break;
        case 6: direction = "Ю"; break;
        case 7: direction = "ЮВ"; break;
        case 8: direction = "В"; break;    
      }
      
      return direction;     
    }        
  }
 
  
  class Flight extends Path {
    constructor(map) {
      super(map);
      this.chute = new Chute(10, 5);
      this.wind = new Wind(5, 0);  // West wind, 5 m/sec
      this.startHeight = 300;  // meters
    }
    
    addVertex(point) {
      super.addVertex(point);
      this.printResults(this.calculateTime());       
    }
 
    removeVertex(e) {
      super.removeVertex(e);
      this.printResults(this.calculateTime()); 
    }
    
    clear(e) {
      super.clear(e);
      this.printResults(this.calculateTime());
    }

    calculateTime() {  
      // Method return time array, totaldist
    
      var time = [];      // time of flying along each Path segment (in seconds)
                          // time[i] = -1 if it is impossible to fly i-segment
      var totaldist = 0;  // total distance of Path (in meters)  
                
      var currentVertex = this.firstVertex;
      
      if (this.numberOfVertices > 0) time[0] = 0;
      
      for(var i=1; i < this.numberOfVertices; i++) {
                
        // Let's find right norm basis (e, f), first vector of which
        // has the same direction with vector prevPointcurrentPoint
          
        var nextVertex = currentVertex.nextVertex;
       
        var currentPoint = currentVertex.geometry.getCoordinates();
        var nextPoint = nextVertex.geometry.getCoordinates();        
          
        var dist = ymaps.coordSystem.geo.getDistance(currentPoint, nextPoint);
        
        totaldist += dist;

        // Yandex Maps Coordinates: (latitude, longitude)
        // Latitude is increasing from bottom to top (-90deg, 90deg)
        // Longitude is increasing from West to East (-180deg, 180deg)
        var ex = nextPoint[1] - currentPoint[1];
        var ey = nextPoint[0] - currentPoint[0]; 
                                 
        var d = Math.sqrt(ex*ex + ey*ey);
        ex = ex / d;
        ey = ey / d;
        
        var fx = -ey;
        var fy = ex;
        
        // Let's find coordinates (we, wf) of vector 'wind' in basis (e, f).
        // (e, f) is orthogonal basis, so we = (wind, e), wf = (wind, f).
        var [wx, wy] = this.wind.getXY();
     
        var we = wx * ex + wy * ey; 
        var wf = wx * fx + wy * fy;     
         
        // Let's find coordinates (ce, cf) of chute velocity 
        // in basis (e, f):
        
        var cf = (-1)*wf;
        
        if (this.chute.horizontalVel < Math.abs(cf)) {
          time[i] = -1;  // it is impossible to fly this segment
          break;
        }
        
        var ce = Math.sqrt(this.chute.horizontalVel**2 - cf**2);
        
        // We consider only case, where ce > 0
        // (it's always the case, if chute velocity is greater than wind velocity)    
        // In general case you should consider case, 
        // when ce < 0 (case when diver flies forward with his back)   

        if (ce + we <= 0.1) {  // 0.1 m/sec is too small velocity
          time[i] = -1;        // it is impossible to fly this segment
          break;
        } else {
          time[i] = dist / (ce + we);                   
        }

        currentVertex = nextVertex;        
      }
            
      return [time, totaldist];          
    }

    printResults(arr) {      
      var [time, totaldist] = arr;   
      var outputDiv = document.getElementById("outputConsole");
      var flightIsPossible = false;         

      if (time.length == 0) {
        flightIsPossible = true;  // empty Path
      } else {
        if (time[time.length - 1] != -1) flightIsPossible = true;
      }
      
      if (flightIsPossible) {        
        var height = this.startHeight;
        var totaltime = 0;
        var currentVertex = this.firstVertex;
        
        if (time.length > 1) {
          for(var i=0; i<time.length; i++) {
            totaltime += time[i];
            height -= time[i] * this.chute.verticalVel;    

            currentVertex.properties.set("hintContent", "h=" + 
                                         Math.floor(height) + "м");
                                                                                  
            currentVertex = currentVertex.nextVertex;
          }
        }

        heightOutput.data.set("content", 
                                      "Высота: " + Math.floor(height) + " м");           
      } else { 
        heightOutput.data.set("content", "Невозможно!");           
      }

      windOutput.data.set("content", "Ветер: " + 
        this.wind.value + " м/с, " + this.wind.getDirection());                                     
    }    
  }
  
  var flight = new Flight(map);
  flight.printResults(flight.calculateTime());

  map.events.add("click", function(e) {
    var point = e.get('coords'); 
    flight.addVertex(point);
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
        arrow.arrowPlacemark.geometry.setCoordinates(map.getCenter());
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
    $(windowjQuerySelector + "Cross").click(function() {
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
  clearButton.events.add("click", flight.clear);
  
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
    arrow.arrowPlacemark.geometry.setCoordinates(mapCenter);
  });
  
  $("#startHeight").val(flight.startHeight); 
  
  $("#startHeight").on("change", function () {       
    var s = $("#startHeight").val();
    var n = Number.parseFloat(s);
    if ((n >= 4) && (n <= 4000)) {
      flight.startHeight = n;      
    }
    $("#startHeight").val(flight.startHeight);          
    flight.printResults(flight.calculateTime());
  });  
  
  
  // Chute Button
  var chuteButton = createButtonControlElement("Настройки парашюта", "images/icon_chute.svg");
  connectButtonToWindow(chuteButton, "#chuteMenu");

  // Chute menu initialization
  $("#chutehorvel").val(flight.chute.horizontalVel);
  $("#chutevervel").val(flight.chute.verticalVel);

  $("#chutehorvel, #chutevervel").on("change", function () {      
    var chutehorvel = Number.parseFloat($("#chutehorvel").val());
    if ((chutehorvel>=0) && (chutehorvel<=25)) {
      flight.chute.horizontalVel = chutehorvel;
    }
    $("chutehorvel").val(flight.chute.horizontalVel);
          
    var chutevervel = Number.parseFloat($("#chutevervel").val());
    if (( chutevervel>=0) && (chutevervel<=50)) {
      flight.chute.verticalVel = chutevervel;    
    } 
    $("#chutevervel").val(flight.chute.verticalVel);
           
    flight.printResults(flight.calculateTime());
  }); 

  
  // Help Button
  var helpButton = createButtonControlElement("Справка", "images/icon_help.svg");
  connectButtonToWindow(helpButton, "#helpMenu");

  
  // For mobile case we add button that block map movings   
  /*
  if(isMobile) {  
    var blockButton = createButtonControlElement("Блокировать карту", "images/icon_block.svg");
    var mapIsBlocked = false;    
    function noscroll() {
      window.scrollTo(0, 0);
    }    
    blockButton.events.add("click", function() {
      mapIsBlocked = !mapIsBlocked;
      if (mapIsBlocked) {
        map.behaviors.disable(['drag']);
        window.addEventListener('scroll', noscroll);
        blockButton.data.set('cssclass', 'pressedInputControlElement');      
      } else { 
        map.behaviors.enable(['drag']);
        window.removeEventListener('scroll', noscroll);
        blockButton.data.set('cssclass', 'inputControlElement');
      }      
    });
  } */


  // Wind Button
  var windButton = createButtonControlElement("Настройка ветра", "images/icon_arrow.svg");  
  connectButtonToWindow(windButton, "#windMenu");

  // Wind menu initialization
  $("#windDirectionInput").val(flight.wind.angle);
  $("#windValueInput").val(flight.wind.value);
  
  $("#windDirectionInput").on('input change', function() {
    var angleStr = $("#windDirectionInput").val();          
    var angle = Number.parseInt(angleStr);
    arrow.rotate(angle);
    flight.wind.angle = angle;
    flight.printResults(flight.calculateTime());      
  });
  
  $("#windValueInput").on('input change', function() {
    var valueStr = $("#windValueInput").val();
    var value = Number.parseInt(valueStr);    
    flight.wind.value = value; 
    flight.printResults(flight.calculateTime());
  });


  // Change Wind by keyboard
  $("html").keydown(function(e) { 
    var key = e.which;
    switch(key) {
      case 39: 
        flight.wind.angle += 5;
        if (flight.wind.angle > 180) { 
          flight.wind.angle = -180 + (flight.wind.angle - 180);
        }  
        arrow.rotate(flight.wind.angle);
        $("#windDirectionInput").val(flight.wind.angle);     
        flight.printResults(flight.calculateTime()); 
        break;
      case 37: 
        flight.wind.angle -= 5;
        if (flight.wind.angle < -180) {
          flight.wind.angle = 180 - (-180 - flight.wind.angle);
        }  
        arrow.rotate(flight.wind.angle);
        $("#windDirectionInput").val(flight.wind.angle);      
        flight.printResults(flight.calculateTime());
        break;
      case 38: 
        flight.wind.value++;
        if (flight.wind.value > 10) flight.wind.value = 10;
        $("#windValueInput").val(flight.wind.value);
        flight.printResults(flight.calculateTime());         
        break;
      case 40: 
        flight.wind.value--;
        if (flight.wind.value < 0) flight.wind.value = 0;
        $("#windValueInput").val(flight.wind.value);             
        flight.printResults(flight.calculateTime());
        break;
    }  
  });   


  // Adding Buttons to Map.  
  map.controls.add(dzHeightButton, {position: {top: 45, left: 10}});
  map.controls.add(chuteButton, {position: {top: 75, left: 10}});
  map.controls.add(windButton, {position: {top: 105, left: 10}});
  map.controls.add(helpButton, {position: {top: 135, left: 10}}); 
  
  map.controls.add(clearButton, {position: {top: 165, left: 10}});
  
  /*
  if (isMobile) {
    map.controls.add(blockButton, {position: {top: 165, left: 10}});
  }*/
  
}