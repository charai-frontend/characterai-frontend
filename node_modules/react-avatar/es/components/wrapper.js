import _Reflect$construct from "core-js-pure/stable/reflect/construct.js";
import _Object$keys from "core-js-pure/stable/object/keys.js";
import _Object$getOwnPropertySymbols from "core-js-pure/stable/object/get-own-property-symbols.js";
import _filterInstanceProperty from "core-js-pure/stable/instance/filter.js";
import _Object$getOwnPropertyDescriptor from "core-js-pure/stable/object/get-own-property-descriptor.js";
import _Object$getOwnPropertyDescriptors from "core-js-pure/stable/object/get-own-property-descriptors.js";
import _Object$defineProperties from "core-js-pure/stable/object/define-properties.js";
import _Object$defineProperty from "core-js-pure/stable/object/define-property.js";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = _Reflect$construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !_Reflect$construct) return false; if (_Reflect$construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(_Reflect$construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React from 'react';
import PropTypes from 'prop-types';
import { parseSize, calculateBorderRadius } from '../utils';

var AvatarWrapper = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(AvatarWrapper, _React$PureComponent);

  var _super = _createSuper(AvatarWrapper);

  function AvatarWrapper() {
    _classCallCheck(this, AvatarWrapper);

    return _super.apply(this, arguments);
  }

  _createClass(AvatarWrapper, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          className = _this$props.className,
          unstyled = _this$props.unstyled,
          round = _this$props.round,
          style = _this$props.style,
          avatar = _this$props.avatar,
          onClick = _this$props.onClick,
          children = _this$props.children;
      var sourceName = avatar.sourceName;
      var size = parseSize(this.props.size);
      var hostStyle = unstyled ? null : _objectSpread({
        display: 'inline-block',
        verticalAlign: 'middle',
        width: size.str,
        height: size.str,
        borderRadius: calculateBorderRadius(round),
        fontFamily: 'Helvetica, Arial, sans-serif'
      }, style);
      var classNames = [className, 'sb-avatar'];

      if (sourceName) {
        var source = sourceName.toLowerCase().replace(/[^a-z0-9-]+/g, '-') // only allow alphanumeric
        .replace(/^-+|-+$/g, ''); // trim `-`

        classNames.push('sb-avatar--' + source);
      }

      return /*#__PURE__*/React.createElement("div", {
        className: classNames.join(' '),
        onClick: onClick,
        style: hostStyle
      }, children);
    }
  }]);

  return AvatarWrapper;
}(React.PureComponent);

_defineProperty(AvatarWrapper, "propTypes", {
  className: PropTypes.string,
  round: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  style: PropTypes.object,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  unstyled: PropTypes.bool,
  avatar: PropTypes.object,
  onClick: PropTypes.func,
  children: PropTypes.node
});

export { AvatarWrapper as default };