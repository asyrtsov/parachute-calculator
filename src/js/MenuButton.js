ymaps.modules.define('MenuButton', [
  'control.Button'
],
function(provide, Button) {
  /**
   * MenuButton creates Yandex.Maps API Button.
   * If you click this Button, then CSS property
   * 'left' of two DOM elements (Element1 with jQuerySelector1 and
   *  Element2 with jQuerySelector2) will be set to be 0.
   * @extends control.Button
   */
  class MenuButton extends Button {
    /**
     * @param {string} [title] - Button hint.
     * @param {string} [image] - Src for <img> tag of this button.
     * @param {string} [jQuerySelector1] - jQuery selector for Element1.
     * @param {string} [jQuerySelector2] - jQuery selector for Element2.
     * @param {string} [cssclass] - Css for this button.
     */
    constructor(
      title,
      image,
      jQuerySelector1,
      jQuerySelector2,
      cssclass='inputControlElement'
    ) {
      super({
        data: {
          title: title,
          image: image,
          cssclass: cssclass
        },
        options: {
          layout: ymaps.templateLayoutFactory.createClass(
            "<div title='{{data.title}}' class='{{data.cssclass}}'>" +
              //"<img class='iconimage' src='{{data.image}}'>" +
              "<div class='iconimage'>" +
            "</div>"
          ),
          maxWidth: 300
        }
      });

      // Result of this Button clicking
      this.events.add('click', function() {
        $(jQuerySelector2).css("left", "0");
        $(jQuerySelector1).css("left", "0");
      });
    }
  }
  provide(MenuButton);
});
