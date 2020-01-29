ymaps.modules.define('AppMap', [
  'Map',
  'control.ZoomControl',
  'Constant',
  'MenuButton',
  'OutputElement',
  'Arrow'
],
function(provide, Map, ZoomControl, Constant,
    MenuButton, OutputElement, Arrow) {
  /**
   * @extends Map
   */
  class AppMap extends Map {

    constructor() {

      // Array of Dropzones and their coordinates.
      var dz = [
        {name: "Коломна", mapCenter: [55.091289443603706, 38.917269584802675]},
        {name: "Пущино", mapCenter: [54.78929269708931,37.64268598670033]},
        {name: "Ватулино", mapCenter: [55.663193308717396,36.14121807608322]}
      ];

      super("map", {
        center: dz[0].mapCenter,
        zoom: Constant.defaultZoom
      }, {
        suppressMapOpenBlock: true  // remove button 'open in yandex maps'
      });

      this.dz = dz;

      // view from space
      this.setType("yandex#satellite");
      this.cursors.push('arrow');
      this.controls.remove('trafficControl');
      this.controls.remove('zoomControl');
      var zoomControl = new ZoomControl({options: {
        position: { right: 10, top: 105 },
        size: 'small'
      }});
      this.controls.add(zoomControl);
      this.controls.remove('geolocationControl');
      this.controls.remove('fullscreenControl');

      this.searchControl = this.controls.get('searchControl');
      this.searchControl.options.set('size', 'small');
      this.searchControl.options.set('noPlacemark', true);
      this.searchControl.options.set('noSelect', true);
      this.searchControl.options.set('position', {top: 10, left: 45});

      // Settings menu (ymaps.Button)
      var settingsButton = new MenuButton("Настройки", "images/icon_menu.svg",
        "#settingsMenu", "#settingsMenuDarkScreen");
      //this.controls.add(settingsButton, {position: {top: 45, left: 10}});
      this.controls.add(settingsButton, {position: {top: 10, left: 10}});

      // Output for Surface wind parameters (ymaps.Button)
      this.windOutput = new OutputElement();
      this.controls.add(this.windOutput, {position: {bottom: 30, left: 10}});

      // Wind arrow (Windsock)
      this.arrow = new Arrow(this.getCenter());
      this.geoObjects.add(this.arrow);

      // remove standart map zoom for double click
      this.events.add('dblclick', function(e) {
        e.preventDefault();
      });

      //this.menu = null;
    }

    /**
     * Processing of yandex.maps search
     */   /*
    setSearchProcessor(calculator) {

      this.calculator = calculator;
      this.path = calculator.path;
      this.windList = calculator.windList;

      this.defaultZoom = Constant.defaultZoom;

      this.searchControl.events.add('resultshow', function(e) {

        this.path.clear();
        this.setZoom(this.defaultZoom);
        //this.windList.shiftList(this.getCenter());
        this.map.arrow.setCoordinates(this.map.getCenter());

        var index = e.get('index');
        var geoObjectsArray = this.searchControl.getResultsArray();
        var resultName = geoObjectsArray[index].properties.get('name');

        var newDz = {
          name: resultName,
          mapCenter: this.getCenter()
        };
        this.dz.push(newDz);
        $("#dz").append("<option>" + newDz.name + "</option>");
        $("#dz").children()[this.dz.length - 1].selected = true;
      }.bind(this));
    }  */

  }
  provide(AppMap);
});