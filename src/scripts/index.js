/** 
 * Program calculate height of Chute for 
 * given point on the Path. Path is a set of line segments (edges).
 * You can input Path by clicking left mouse button.
 */
 
      
ymaps.ready(init);  
function init() {   
  ymaps.modules.require([
    'AppMap',
    'WindList',     
    'Chute',
    'Path',    
    'Calculator',  
    'HeightOutputElement', 
    //'WindOutputElement', 
    'Menu', 
    'DialogWindows', 
    'Keyboard', 
    'Constant'
  ]).spread(function (
    AppMap,
    WindList,     
    Chute,
    Path,      
    Calculator, 
    HeightOutputElement,
    //WindOutputElement, 
    Menu, 
    DialogWindows, 
    Keyboard, 
    Constant   
  ) {
    var map = new AppMap();
    
    var chute = new Chute(10, 5);  // Chute velocity = (10, 5) m/s 

    var windList = new WindList(map);  // Winds at several heights.
    //windList.addNewWind();
    //windList.setHeightToCurrentWind(100);    
    
    var path = new Path(map);  // List of vertices, edges. 
    
    var boundaryHeights = {
      startHeight: Constant.defaultStartHeight, 
      finalHeight: Constant.defaultFinalHeight
    };
        
    // Calculator will make all computations.
    var calculator = new Calculator(
      path, 
      chute,       
      windList,
      boundaryHeights      
    );
    path.setCalculator(calculator);     

    
    // Output window at the top left corner of the screen.    
    var heightOutput = new HeightOutputElement(Constant.defaultStartHeight);   
    map.controls.add(heightOutput, {float: 'left'});
    path.setHeightOutput(heightOutput);

    
    // Output window at the top left corner of the screen.    
    //var windOutput = new WindOutputElement(windList.currentWind);
    //map.controls.add(windOutput, {float: 'left'});  

          
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
      map, 
      path, 
      heightOutput, 
      //windOutput, 
      calculator, 
      chute, 
      windList, 
      boundaryHeights
    );

    
    // Add keyboard events: 
    //   left, right, up, down pressing (for changing wind value and direction), 
    //   enter key press on <input> tag - to loose focus after pressing enter.  
    Keyboard.startKeyboardProcessing(
      windList, 
      //calculator, 
      //windOutput, 
      heightOutput, 
      path
    ); 

    
    // After yandex maps search we should: 
    //   move wind arrows to the current screen, 
    //   add result of search to Settings Dialog Window.
    map.setSearchProcessor(path, heightOutput, calculator, windList); 
  });      
}