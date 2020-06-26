function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('MenuButton', ['control.Button'], function (provide, Button) {
  /**
   * MenuButton creates Yandex.Maps API Button.
   * If you click this Button, then CSS property 
   * 'left' of two DOM elements (Element1 with jQuerySelector1 and 
   *  Element2 with jQuerySelector2) will be set to be 0. 
   * @extends control.Button
   */
  var MenuButton = function (_Button) {
    _inherits(MenuButton, _Button);

    /**
     * @param {string} [title] - Button hint.
     * @param {string} [image] - Src for <img> tag of this button.
     * @param {string} [jQuerySelector1] - jQuery selector for Element1. 
     * @param {string} [jQuerySelector2] - jQuery selector for Element2. 
     * @param {string} [cssclass] - Css for this button.          
     */
    function MenuButton(title, image, jQuerySelector1, jQuerySelector2) {
      var cssclass = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'inputControlElement';

      _classCallCheck(this, MenuButton);

      // Result of this Button clicking
      var _this = _possibleConstructorReturn(this, (MenuButton.__proto__ || Object.getPrototypeOf(MenuButton)).call(this, {
        data: {
          title: title,
          image: image,
          cssclass: cssclass
        },
        options: {
          layout: ymaps.templateLayoutFactory.createClass("<div title='{{data.title}}' class='{{data.cssclass}}'>" + "<img class='iconimage' src='{{data.image}}'>" + "</div>"),
          maxWidth: 300
        }
      }));

      _this.events.add('click', function () {
        $(jQuerySelector2).css("left", "0");
        $(jQuerySelector1).css("left", "0");
      });
      return _this;
    }

    return MenuButton;
  }(Button);

  provide(MenuButton);
});