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
    Menu, 
    DialogWindows, 
    Keyboard, 
    Constant   
  ) {
    var map = new AppMap();
    
    var chute = new Chute(10, 5);  // Chute velocity = (10, 5) m/s 

    var windList = new WindList(map);  // Winds at several heights.
     
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
    windList.setCalculator(calculator);
    windList.setPath(path);    

              
    // Click on the map will add vertice to path
    /*    
    map.events.add('click', function(e) {
      var point = e.get('coords');
      path.addVertex(point);      
    }); */

    // Set of buttons in the left side of screen:
    //   Settings, Chute, Wind, Help, Clean buttons. 
    var menu = new Menu(map, path);      
    
   
    var clickNumber = 0;

    map.events.add('click', function(e) {
      var point = e.get('coords');    
      clickNumber++;
      if (clickNumber == 1) {
        setTimeout(function() {        
          if (clickNumber == 1) {  // Single Click
            // We add vertex to path           
            path.addVertex(point);                               
          } else {  // Double Click
            // We add new wind arrow (windsock)           
            windList.addWind(point);
            windList.printCurrentWindWindow();
            menu.windButton.showMenu();
            $("#menuArrow").removeClass("arrow");
            $("#menuArrow").addClass("arrow_selected");             
          }
          clickNumber = 0;           
        }, 200);
      }    
    });
    
            
    // Add events processing for Dialog Windows:
    //   for Settings, Chute, Wind windows.
    DialogWindows.initializeWindows(
      map, 
      path, 
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
      calculator, 
      path
    ); 

    
    // After yandex maps search we should: 
    //   move wind arrows to the current screen, 
    //   add result of search to Settings Dialog Window.
    map.setSearchProcessor(path, calculator, windList); 
  });      
}