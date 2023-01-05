import _Reflect$construct from "core-js-pure/stable/reflect/construct.js";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _concatInstanceProperty from "core-js-pure/stable/instance/concat.js";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = _Reflect$construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !_Reflect$construct) return false; if (_Reflect$construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(_Reflect$construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from './wrapper';
import { parseSize, setGroupedTimeout, calculateBorderRadius, getNullableText } from '../utils';

var AvatarText = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(AvatarText, _React$PureComponent);

  var _super = _createSuper(AvatarText);

  function AvatarText() {
    var _context;

    var _this;

    _classCallCheck(this, AvatarText);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, _concatInstanceProperty(_context = [this]).call(_context, args));

    _defineProperty(_assertThisInitialized(_this), "_scaleTextNode", function (node) {
      var retryTTL = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
      var _this$props = _this.props,
          unstyled = _this$props.unstyled,
          textSizeRatio = _this$props.textSizeRatio,
          textMarginRatio = _this$props.textMarginRatio,
          avatar = _this$props.avatar;
      _this._node = node;
      if (!node || !node.parentNode || unstyled || avatar.src || !_this._mounted) return;
      var spanNode = node.parentNode;
      var tableNode = spanNode.parentNode;

      var _spanNode$getBounding = spanNode.getBoundingClientRect(),
          containerWidth = _spanNode$getBounding.width,
          containerHeight = _spanNode$getBounding.height; // Whenever the avatar element is not visible due to some CSS
      // (such as display: none) on any parent component we will check
      // whether the component has become visible.
      //
      // The time between checks grows up to half a second in an attempt
      // to reduce flicker / performance issues.


      if (containerWidth == 0 && containerHeight == 0) {
        var ttl = Math.min(retryTTL * 1.5, 500);
        setGroupedTimeout(function () {
          return _this._scaleTextNode(node, ttl);
        }, ttl);
        return;
      } // If the tableNode (outer-container) does not have its fontSize set yet,
      // we'll set it according to "textSizeRatio"


      if (!tableNode.style.fontSize) {
        var baseFontSize = containerHeight / textSizeRatio;
        tableNode.style.fontSize = "".concat(baseFontSize, "px");
      } // Reset font-size such that scaling works correctly (#133)


      spanNode.style.fontSize = null; // Measure the actual width of the text after setting the container size

      var _node$getBoundingClie = node.getBoundingClientRect(),
          textWidth = _node$getBoundingClie.width;

      if (textWidth < 0) return; // Calculate the maximum width for the text based on "textMarginRatio"

      var maxTextWidth = containerWidth * (1 - 2 * textMarginRatio); // If the text is too wide, scale it down by (maxWidth / actualWidth)

      if (textWidth > maxTextWidth) spanNode.style.fontSize = "calc(1em * ".concat(maxTextWidth / textWidth, ")");
    });

    return _this;
  }

  _createClass(AvatarText, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this._mounted = true;

      this._scaleTextNode(this._node);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._mounted = false;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          className = _this$props2.className,
          round = _this$props2.round,
          unstyled = _this$props2.unstyled,
          title = _this$props2.title,
          name = _this$props2.name,
          value = _this$props2.value,
          avatar = _this$props2.avatar;
      var size = parseSize(this.props.size);
      var initialsStyle = unstyled ? null : {
        width: size.str,
        height: size.str,
        lineHeight: 'initial',
        textAlign: 'center',
        color: this.props.fgColor,
        background: avatar.color,
        borderRadius: calculateBorderRadius(round)
      };
      var tableStyle = unstyled ? null : {
        display: 'table',
        tableLayout: 'fixed',
        width: '100%',
        height: '100%'
      };
      var spanStyle = unstyled ? null : {
        display: 'table-cell',
        verticalAlign: 'middle',
        fontSize: '100%',
        whiteSpace: 'nowrap'
      }; // Ensure the text node is updated and scaled when any of these
      // values changed by calling the `_scaleTextNode` method using
      // the correct `ref`.

      var key = [avatar.value, this.props.size].join('');
      return /*#__PURE__*/React.createElement(Wrapper, this.props, /*#__PURE__*/React.createElement("div", {
        className: className + ' sb-avatar__text',
        style: initialsStyle,
        title: getNullableText(title, name || value)
      }, /*#__PURE__*/React.createElement("div", {
        style: tableStyle
      }, /*#__PURE__*/React.createElement("span", {
        style: spanStyle
      }, /*#__PURE__*/React.createElement("span", {
        ref: this._scaleTextNode,
        key: key
      }, avatar.value)))));
    }
  }]);

  return AvatarText;
}(React.PureComponent);

_defineProperty(AvatarText, "propTypes", {
  name: PropTypes.string,
  value: PropTypes.string,
  avatar: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  className: PropTypes.string,
  unstyled: PropTypes.bool,
  fgColor: PropTypes.string,
  textSizeRatio: PropTypes.number,
  textMarginRatio: PropTypes.number,
  round: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
});

_defineProperty(AvatarText, "defaultProps", {
  className: '',
  fgColor: '#FFF',
  round: false,
  size: 100,
  textSizeRatio: 3,
  textMarginRatio: .15,
  unstyled: false
});

export { AvatarText as default };