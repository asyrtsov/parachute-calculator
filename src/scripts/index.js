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
    'Window', 
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
    Window, 
    Keyboard    
  ) {
    var defaultZoom = 16;  
    var map = new AppMap(dz[0].mapCenter, defaultZoom);
    
    var wind = new Wind(5, 0);     // West wind, 5 m/sec      
    var chute = new Chute(10, 5);  // Chute velocity = (10, 5) m/s
    var path = new Path(map, isMobile); 
    
    // Varialable startHeight is used only for Calculator initialization. 
    // Later use calculator.getStartHeight() for height value.
    var startHeight = 300;   // meters
    
    var calculator = new Calculator(path, wind, chute, startHeight);
    path.calculator = calculator;    
        
    var heightOutput = new HeightOutputElement(path, calculator.getStartHeight());   
    map.controls.add(heightOutput, {float: 'left'});
    path.heightOutput = heightOutput;
        
    var windOutput = new WindOutputElement(wind);
    map.controls.add(windOutput, {float: 'left'});  

    // Arrow (windsock) creation
    var arrow = new Arrow(map, isMobile);        
    map.geoObjects.add(arrow); 
    
          
    map.events.add('click', function(e) {
      var point = e.get('coords');
      path.addVertex(point);      
    });
    
    
    // Sometimes yandex search doesn't work
    map.setSearchProcessor(path, heightOutput, calculator, arrow, dz);
    
    
    var menu = new Menu(map, path);
    

    Window.initHtmlWindows(
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
    
         
    Keyboard.startKeyboardProcessing(
      wind, 
      arrow, 
      calculator, 
      windOutput, 
      heightOutput, 
      path
    );  
 
  });      
}