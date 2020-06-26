/**
 * Program calculate heights of Glider (Chute) for
 * Vertices of the Path. Path is a set of Vertices and Edges.
 * You can input Path by clicking on the Yandex Map.
 */
ymaps.ready(init);
function init() {
  ymaps.modules.require(['AppMap', 'WindList', 'Chute', 'Path', 'Calculator', 'DialogWindows']).spread(function (AppMap, WindList, Chute, Path, Calculator, DialogWindows) {
    // Yandex map
    var map = new AppMap();

    // Chute velocity = (10, 5) m/s
    var chute = new Chute(10, 5);

    // Winds at several heights
    var windList = new WindList(map);

    // List of Vertices and Edges
    var path = new Path(map);
    map.setPath(path);

    // Calculator will make all computations
    var calculator = new Calculator(path, chute, windList);
    path.setCalculator(calculator);
    windList.setCalculator(calculator);

    // Click on the map will add vertice to the end of the Path,
    // double click on the map will add vertice to the beginning of the Path.
    var clickNumber = 0;
    map.events.add('click', function (e) {
      var point = e.get('coords');
      clickNumber++;
      if (clickNumber == 1) {
        setTimeout(function () {
          if (clickNumber == 1) {
            // Single Click
            // We add vertex to the end of the Path
            path.addVertex(point, true);
          } else {
            // Double Click
            // We add new vertex to the beginning of the Path
            path.addVertex(point, false);
          }
          clickNumber = 0;
        }, 200);
      }
    });

    map.events.add('boundschange', function () {
      calculator.calculateHeight();
    });

    /**
     * Menu initialization
     */
    DialogWindows.initMenu(map, chute, windList, path, calculator);
  });
}