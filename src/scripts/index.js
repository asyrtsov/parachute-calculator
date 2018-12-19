/** 
 * Program calculate height of Chute for 
 * given point on the Path. Path is a set of line segments (edges).
 * You can input Path by clicking left mouse button.
 */
 
 
// Determine mobile or desktop case.
var isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { 
  isMobile = true;
}

// Array of Dropzones and their coordinates.
var dz = [
  {name: "Коломна", mapCenter: [55.091289443603706, 38.917269584802675]}, 
  {name: "Пущино", mapCenter: [54.78929269708931,37.64268598670033]}, 
  {name: "Ватулино", mapCenter: [55.663193308717396,36.14121807608322]}
];

     
ymaps.ready(init);  
function init() {   
  ymaps.modules.require([
    'AppMap',
    'Wind', 
    'Chute',
    'Path',    
    'Calculator', 
    'Arrow', 
    'HeightOutputElement', 
    'WindOutputElement', 
    'Menu', 
    'DialogWindows', 
    'Keyboard'
  ]).spread(function (
    AppMap,
    Wind, 
    Chute,
    Path,      
    Calculator, 
    Arrow, 
    HeightOutputElement,
    WindOutputElement, 
    Menu, 
    DialogWindows, 
    Keyboard    
  ) {
    var defaultZoom = 16;  
    var map = new AppMap(dz[0].mapCenter, defaultZoom);
    
    var wind = new Wind(5, 0);     // West wind, 5 m/sec      
    var chute = new Chute(10, 5);  // Chute velocity = (10, 5) m/s
    
    // Set of vertices, edges.
    var path = new Path(map, isMobile, true); 
        
    // Calculator will make all computations.
    var calculator = new Calculator(path, wind, chute, 300);
    path.calculator = calculator;    

    
    // Output window at the top left corner of the screen.    
    var heightOutput = new HeightOutputElement(path, calculator.getStartHeight());   
    map.controls.add(heightOutput, {float: 'left'});
    path.heightOutput = heightOutput;

    
    // Output window at the top left corner of the screen.    
    var windOutput = new WindOutputElement(wind);
    map.controls.add(windOutput, {float: 'left'});  

    
    // Arrow (windsock)
    var arrow = new Arrow(map, isMobile);        
    map.geoObjects.add(arrow); 

    
    // Click on the map will add vertice to path    
    map.events.add('click', function(e) {
      var point = e.get('coords');
      path.addVertex(point);      
    });

    
    // Set of buttons in the left side of screen:
    //   Settings, Chute, Wind, Help, Clean buttons. 
    var menu = new Menu(map, path);    

    
    // Add events processing for Dialog Windows:
    //   for Settings, Chute, Wind windows.
    DialogWindows.initializeWindows(
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
    );

    
    // Add keyboard events: 
    //   left, right, up, down pressing (for changing wind value and direction), 
    //   enter key press on <input> tag - to loose focus after pressing enter.  
    Keyboard.startKeyboardProcessing(
      wind, 
      arrow, 
      calculator, 
      windOutput, 
      heightOutput, 
      path
    ); 

    
    // After yandex maps search we should: 
    //   set arrow (windsock) in the center of screen, 
    //   add result of search to Settings Dialog Window.
    map.setSearchProcessor(path, heightOutput, calculator, arrow, dz, defaultZoom); 
  });      
}