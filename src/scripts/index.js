/**
 * Program calculate heights of Chute for
 * Vertices of the Path. Path is a set of line segments (Edges).
 * You can input Path by clicking on the Map.
 */

ymaps.ready(init);
function init() {
  ymaps.modules.require([
    'AppMap',
    'WindList',
    'Chute',
    'Path',
    'Calculator',
    'DialogWindows',
    'BoundaryHeights'
  ]).spread(function (
    AppMap,
    WindList,
    Chute,
    Path,
    Calculator,
    DialogWindows,
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
            /*
            if (windList.lastWind.getHeight() != null) {
              windList.addWind(point);
              windList.printCurrentWindWindow();
              menu.windButton.showMenu();
              $("#menuArrow").removeClass("arrow");
              $("#menuArrow").addClass("arrow_selected");
            } */
          }
          clickNumber = 0;
        }, 200);
      }
    });


    // This function should be tested after adding Yandex API Key
    // After yandex maps search we should:
    //   move wind arrows to the current screen,
    //   add result of search to Settings Dialog Window.
    /*map.searchControl.events.add('resultshow', function(e) {
                
      path.clear(); 
      //this.setZoom(this.defaultZoom);        
      //this.windList.shiftList(this.getCenter());
               
      var index = e.get('index');    
      var geoObjectsArray = map.searchControl.getResultsArray();
      var resultName = geoObjectsArray[index].properties.get('name');

      var newDz = {
        name: resultName, 
        mapCenter: map.getCenter()
      };    
      map.dz.push(newDz);    
      $("#dz").append("<option>" + newDz.name + "</option>");    
      $("#dz").children()[map.dz.length - 1].selected = true;    
    }); */  



    /**
     * Menu initialization
     */
    DialogWindows.initMenu(calculator);
  });
}