/**
 * Program calculate heights of Chute for
 * vertices of the Path. Path is a set of line segments (edges).
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
    'Constant', 
    'BoundaryHeights'
  ]).spread(function (
    AppMap,
    WindList,
    Chute,
    Path,
    Calculator,
    Menu,
    DialogWindows,
    Keyboard,
    Constant, 
    BoundaryHeights
  ) {
    // Yandex map
    var map = new AppMap();

    // Chute velocity = (10, 5) m/s
    var chute = new Chute(10, 5);

    // Winds at several heights
    var windList = new WindList(map);

    // List of vertices and edges
    var path = new Path(map);
    
    // Heights at the beginning and end of the Path
    var boundaryHeights = new BoundaryHeights();

    // Calculator will make all computations
    var calculator = new Calculator(path, chute, windList, boundaryHeights);

    path.setCalculator(calculator);
    
    windList.setCalculator(calculator);
    windList.setPath(path);

    boundaryHeights.setCalculator(calculator);
    boundaryHeights.setPath(path);

    // Set of buttons in the left side of screen:
    // Settings, Chute, Wind, Help, Clean buttons.
    var menu = new Menu(map, path, windList);

    // Click on the map will add vertice to Path,
    // double click on the map will add wind to WindList.
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
            if (windList.lastWind.getHeight() != null) {
              windList.addWind(point);
              windList.printCurrentWindWindow();
              menu.windButton.showMenu();
              $("#menuArrow").removeClass("arrow");
              $("#menuArrow").addClass("arrow_selected");
            }
          }
          clickNumber = 0;
        }, 200);
      }
    });

    // Add events processing for Dialog Windows:
    //   for Settings, Chute, Wind windows.
    DialogWindows.initializeWindows(calculator);

    // Add keyboard events:
    //   left, right, up, down pressing (for changing wind value and direction),
    //   enter key press on <input> tag - to loose focus after pressing enter.
    Keyboard.startKeyboardProcessing(calculator);

    // After yandex maps search we should:
    //   move wind arrows to the current screen,
    //   add result of search to Settings Dialog Window.
    map.setSearchProcessor(calculator);
  });
}