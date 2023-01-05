import _Reflect$construct from "core-js-pure/stable/reflect/construct.js";
import _extends from "@babel/runtime/helpers/extends";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = _Reflect$construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !_Reflect$construct) return false; if (_Reflect$construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(_Reflect$construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import _Object$keys from "core-js-pure/stable/object/keys.js";
import React from 'react';
import PropTypes from 'prop-types';
import defaultCache from './cache';
import { defaultColors, defaultInitials } from './utils';
var defaults = {
  cache: defaultCache,
  colors: defaultColors,
  initials: defaultInitials,
  avatarRedirectUrl: null
};

var contextKeys = _Object$keys(defaults);
/**
 * withConfig and ConfigProvider provide a compatibility layer for different
 * versions of React equiped with different versions of the Context API.
 *
 * If the new Context API is available it will be used, otherwise we will
 * fall back to the legacy context api.
 */


var ConfigContext = React.createContext && /*#__PURE__*/React.createContext();
var isLegacyContext = !ConfigContext;
var ConfigConsumer = isLegacyContext ? null : ConfigContext.Consumer;
/**
 * This was introduced in React 16.3.0 we need this to
 * prevent errors in newer versions. But we will just forward the
 * component for any version lower than 16.3.0
 *
 * https://github.com/Sitebase/react-avatar/issues/201
 * https://github.com/facebook/react/blob/master/CHANGELOG.md#1630-march-29-2018
 */

var forwardRef = React.forwardRef || function (C) {
  return C;
};

export var ConfigProvider = /*#__PURE__*/function (_React$Component) {
  _inherits(ConfigProvider, _React$Component);

  var _super = _createSuper(ConfigProvider);

  function ConfigProvider() {
    _classCallCheck(this, ConfigProvider);

    return _super.apply(this, arguments);
  }

  _createClass(ConfigProvider, [{
    key: "_getContext",
    value: function _getContext() {
      var _this = this;

      var context = {};
      contextKeys.forEach(function (key) {
        if (typeof _this.props[key] !== 'undefined') context[key] = _this.props[key];
      });
      return context;
    }
  }, {
    key: "render",
    value: function render() {
      var children = this.props.children;
      if (isLegacyContext) return React.Children.only(children);
      return /*#__PURE__*/React.createElement(ConfigContext.Provider, {
        value: this._getContext()
      }, React.Children.only(children));
    }
  }]);

  return ConfigProvider;
}(React.Component);

_defineProperty(ConfigProvider, "displayName", 'ConfigProvider');

_defineProperty(ConfigProvider, "propTypes", {
  cache: PropTypes.object,
  colors: PropTypes.arrayOf(PropTypes.string),
  initials: PropTypes.func,
  avatarRedirectUrl: PropTypes.string,
  children: PropTypes.node
});

export var withConfig = function withConfig(Component) {
  function withAvatarConfig(props, refOrContext) {
    // If legacy context is enabled, there is no support for forwardedRefs either
    if (isLegacyContext) {
      var ctx = refOrContext && refOrContext.reactAvatar;
      return /*#__PURE__*/React.createElement(Component, _extends({}, defaults, ctx, props));
    }
    /* eslint-disable react/display-name */


    return /*#__PURE__*/React.createElement(ConfigConsumer, null, function (config) {
      return /*#__PURE__*/React.createElement(Component, _extends({
        ref: refOrContext
      }, defaults, config, props));
    });
    /* eslint-enable react/display-name */
  } // Legacy support, only set when legacy is detected


  withAvatarConfig.contextTypes = ConfigProvider.childContextTypes;
  return forwardRef(withAvatarConfig);
};

if (isLegacyContext) {
  ConfigProvider.childContextTypes = {
    reactAvatar: PropTypes.object
  };

  ConfigProvider.prototype.getChildContext = function () {
    return {
      reactAvatar: this._getContext()
    };
  };
}