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

  class AppMap extends Map {
    constructor() {
      // Array of Dropzones and their coordinates.
      var dz = [
        {name: 'Коломна', mapCenter: [55.091289443603706, 38.917269584802675]},
        {name: 'Пущино', mapCenter: [54.78929269708931,37.64268598670033]},
        {name: 'Ватулино', mapCenter: [55.663193308717396,36.14121807608322]},
        {name: 'Skydive Dubai', mapCenter: [25.089337722640472,55.13236164813229]},
      ];

      super('map', {
        center: dz[0].mapCenter,
        zoom: Constant.defaultZoom
      }, {
        suppressMapOpenBlock: true  // remove button 'open in yandex maps'
      });

      this.dz = dz;
      this.currentDz = dz[0];
      this.path = null;

      // view from space
      this.setType('yandex#satellite');
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
      var settingsButton = new MenuButton('Настройки', 'images/icon_menu.svg',
          '#menu', '#menuDarkScreen');
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

      this.moveArrow = this.moveArrow.bind(this);
      this.events.add('boundschange', this.moveArrow);

      this.searchControl.events.add('resultshow', function(e) {
        this.processResultShow(e);
      }.bind(this));
    }

    setReactDomRender(reactDomRender) {
      this.reactDomRender = reactDomRender;
    }

    /**
     * If arrow is out of the screen, we should
     * shift it to to the center of the screen.
     */
    moveArrow() {
      var arrowGeoCoordinates =
          this.arrow.geometry.getCoordinates();
      var arrowPixelCoordinates =
          this.getPixelCoordinates(arrowGeoCoordinates);
      var [x, y] = arrowPixelCoordinates;
      if (x < 0 || y < 0 || x > screen.width || y > screen.height) {
        this.arrow.setCoordinates(this.getCenter());
      }
    }

    /**
     * @param {number[]} point - Geo object coordinates.
     * @returns {number[]} - Pixel coordinates.
     */
    getPixelCoordinates(point) {
      var projection = this.options.get('projection');
      return (this.converter.globalToPage(
          projection.toGlobalPixels(
              point,
              this.getZoom()
          )
      ));
    }

    getPixelDistance(pointA, pointB) {
      var x = this.getPixelCoordinates(pointB)[0] -
          this.getPixelCoordinates(pointA)[0];
      var y = this.getPixelCoordinates(pointB)[1] -
          this.getPixelCoordinates(pointA)[1];
       return Math.sqrt(x**2 + y**2);
    }

    setPath(path) {
      this.path = path;
    }

    /**
     * Processing Search result event.
     * You should set up this.path before using this function.
     */
    processResultShow(e) {
      this.path.clear();
      this.setZoom(Constant.defaultZoom);
      this.arrow.setCoordinates(this.getCenter());
      var index = e.get('index');
      var geoObjectsArray = this.searchControl.getResultsArray();
      var resultName = geoObjectsArray[index].properties.get('name');
      var newDz = {
        name: resultName,
        mapCenter: this.getCenter()
      };
      this.dz.push(newDz);

      this.reactDomRender();


      /*
      $('#dz').append('<option>' + newDz.name + '</option>');
      $('#dz').children()[this.dz.length - 1].selected = true;  */
    };
  }
  provide(AppMap);
});