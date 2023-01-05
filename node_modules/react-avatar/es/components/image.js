import _Reflect$construct from "core-js-pure/stable/reflect/construct.js";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = _Reflect$construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !_Reflect$construct) return false; if (_Reflect$construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(_Reflect$construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React from 'react';
import PropTypes from 'prop-types';
import { parseSize, calculateBorderRadius, getNullableText } from '../utils';
import Wrapper from './wrapper';

var AvatarImage = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(AvatarImage, _React$PureComponent);

  var _super = _createSuper(AvatarImage);

  function AvatarImage() {
    _classCallCheck(this, AvatarImage);

    return _super.apply(this, arguments);
  }

  _createClass(AvatarImage, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          className = _this$props.className,
          round = _this$props.round,
          unstyled = _this$props.unstyled,
          alt = _this$props.alt,
          title = _this$props.title,
          name = _this$props.name,
          value = _this$props.value,
          avatar = _this$props.avatar;
      var size = parseSize(this.props.size);
      var imageStyle = unstyled ? null : {
        maxWidth: '100%',
        width: size.str,
        height: size.str,
        borderRadius: calculateBorderRadius(round)
      };
      return /*#__PURE__*/React.createElement(Wrapper, this.props, /*#__PURE__*/React.createElement("img", {
        className: className + ' sb-avatar__image',
        width: size.str,
        height: size.str,
        style: imageStyle,
        src: avatar.src,
        alt: getNullableText(alt, name || value),
        title: getNullableText(title, name || value),
        onError: avatar.onRenderFailed
      }));
    }
  }]);

  return AvatarImage;
}(React.PureComponent);

_defineProperty(AvatarImage, "propTypes", {
  alt: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  name: PropTypes.string,
  value: PropTypes.string,
  avatar: PropTypes.object,
  className: PropTypes.string,
  unstyled: PropTypes.bool,
  round: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
});

_defineProperty(AvatarImage, "defaultProps", {
  className: '',
  round: false,
  size: 100,
  unstyled: false
});

export { AvatarImage as default };