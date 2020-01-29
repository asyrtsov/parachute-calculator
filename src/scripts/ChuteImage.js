ymaps.modules.define('ChuteImage', [
  'Placemark',
  'templateLayoutFactory',
  'Constant'
],
function(provide, Placemark, templateLayoutFactory, Constant) {

  /**
   * Chute Image (Yandex Maps API Placemark).
   * You can: rotate it and change its coordinates.
   */
  class ChuteImage extends Placemark {

    /**
     * @param {null | Number[]} coordinates
     */
    constructor(coordinates = null) {
      var chuteStartSize = 25;
      // radius of start active area for Arrow
      var chuteStartRadius = Constant.isMobile ? chuteStartSize : chuteStartSize/2;

      super(coordinates, {
            chuteClass: 'chute',
            rotation: 0,
            size: chuteStartSize
          }, {
            iconLayout: templateLayoutFactory.createClass(
                '<div class="$[properties.chuteClass]" style="transform: rotate($[properties.rotation]deg);' +
                'width: $[properties.size]px; height: $[properties.size]px;"/>'),
            iconOffset: [-12, -12],
            iconShape: {
              type: 'Circle',
              coordinates: [chuteStartSize/2, chuteStartSize/2],
              radius: chuteStartRadius
            },
            zIndex: 7
          });

      // If this.chuteDirection = true, chute flyes along wind,
      // else - opposite wind.
      this.chuteDirection = true;
      this.calculator = null;

      this.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click
        this.processChuteImageClick(e);
      }.bind(this));
    }


    setCalculator(calculator) {
      this.calculator = calculator;
    }

    processChuteImageClick() {
      this.chuteDirection = !this.chuteDirection;
      if (this.calculator != null) {
        this.calculator.calculateHeight();
      }
    }


    /**
     * @param {Number[]} point
     */
    setCoordinates(point) {
      this.geometry.setCoordinates(point);
    }

    hide() {
      this.options.set('visible', false);
    }

    show() {
      this.options.set('visible', true);
    }

   /**
    * Rotate arrow
    * @param {Number} angle - In degrees.
    */
    rotate(angle) {
      this.properties.set('rotation', (-1)*angle);
    }

    /**
     * angle in degrees.
     */
    setPosition(pointA, pointB, angle) {
      this.setCoordinates([
        (pointA[0] + pointB[0])/2,
        (pointA[1] + pointB[1])/2
      ]);
      this.rotate(angle);
    }
  }

  provide(ChuteImage);
});