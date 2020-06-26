var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

ymaps.modules.define('OutputElement', ['control.Button', 'templateLayoutFactory'], function (provide, Button, templateLayoutFactory) {
  var OutputElement = function (_Button) {
    _inherits(OutputElement, _Button);

    /**
     * @param {string} content
     */
    function OutputElement() {
      var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      _classCallCheck(this, OutputElement);

      return _possibleConstructorReturn(this, (OutputElement.__proto__ || Object.getPrototypeOf(OutputElement)).call(this, {
        data: { content: content },

        options: {
          layout: templateLayoutFactory.createClass("<div class='outputControlElement'>{{data.content}}</div>"),
          maxWidth: 300
        }
      }));
    }

    /**
     *
     * @param {string} str
     */


    _createClass(OutputElement, [{
      key: 'print',
      value: function print(str) {
        this.data.set('content', str);
      }
    }]);

    return OutputElement;
  }(Button);

  provide(OutputElement);
});