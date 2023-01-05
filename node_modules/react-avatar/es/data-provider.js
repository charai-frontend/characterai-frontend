'use strict';

import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); enumerableOnly && (symbols = _filterInstanceProperty(symbols).call(symbols, function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = _Reflect$construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !_Reflect$construct) return false; if (_Reflect$construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(_Reflect$construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import _reduceInstanceProperty from "core-js-pure/stable/instance/reduce.js";
import _Object$assign from "core-js-pure/stable/object/assign.js";
import _Reflect$construct from "core-js-pure/stable/reflect/construct.js";
import _Object$keys from "core-js-pure/stable/object/keys.js";
import _Object$getOwnPropertySymbols from "core-js-pure/stable/object/get-own-property-symbols.js";
import _filterInstanceProperty from "core-js-pure/stable/instance/filter.js";
import _Object$getOwnPropertyDescriptor from "core-js-pure/stable/object/get-own-property-descriptor.js";
import _Object$getOwnPropertyDescriptors from "core-js-pure/stable/object/get-own-property-descriptors.js";
import _Object$defineProperties from "core-js-pure/stable/object/define-properties.js";
import _Object$defineProperty from "core-js-pure/stable/object/define-property.js";
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Cache } from './cache';
import { withConfig, ConfigProvider } from './context';
import InternalState from './internal-state';
export { getRandomColor } from './utils';
export { ConfigProvider } from './context';
export { Cache } from './cache';

function matchSource(Source, props, cb) {
  var cache = props.cache;
  var instance = new Source(props);
  if (!instance.isCompatible(props)) return cb();
  instance.get(function (state) {
    var failedBefore = state && state.src && cache.hasSourceFailedBefore(state.src);

    if (!failedBefore && state) {
      cb(state);
    } else {
      cb();
    }
  });
}

export default function createAvatarDataProvider(_ref) {
  var _ref$sources = _ref.sources,
      sources = _ref$sources === void 0 ? [] : _ref$sources;

  // Collect propTypes for each individual source
  var sourcePropTypes = _reduceInstanceProperty(sources).call(sources, function (r, s) {
    return _Object$assign(r, s.propTypes);
  }, {});

  var AvatarDataProvider = /*#__PURE__*/function (_PureComponent) {
    _inherits(AvatarDataProvider, _PureComponent);

    var _super = _createSuper(AvatarDataProvider);

    function AvatarDataProvider(props) {
      var _this;

      _classCallCheck(this, AvatarDataProvider);

      _this = _super.call(this, props);

      _defineProperty(_assertThisInitialized(_this), "_createFetcher", function (internal) {
        return function (errEvent) {
          var cache = _this.props.cache;
          if (!internal.isActive(_this.state)) return; // Mark img source as failed for future reference

          if (errEvent && errEvent.type === 'error') cache.sourceFailed(errEvent.target.src);
          var pointer = internal.sourcePointer;
          if (sources.length === pointer) return;
          var source = sources[pointer];
          internal.sourcePointer++;
          matchSource(source, _this.props, function (nextState) {
            if (!nextState) return setTimeout(internal.fetch, 0);
            if (!internal.isActive(_this.state)) return; // Reset other values to prevent them from sticking (#51)

            nextState = _objectSpread({
              src: null,
              value: null,
              color: null
            }, nextState);

            _this.setState(function (state) {
              // Internal state has been reset => we received new props
              return internal.isActive(state) ? nextState : {};
            });
          });
        };
      });

      _defineProperty(_assertThisInitialized(_this), "fetch", function () {
        var internal = new InternalState();
        internal.fetch = _this._createFetcher(internal);

        _this.setState({
          internal: internal
        }, internal.fetch);
      });

      _this.state = {
        internal: null,
        src: null,
        value: null,
        color: props.color
      };
      return _this;
    }

    _createClass(AvatarDataProvider, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.fetch();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate(prevProps) {
        var needsUpdate = false; // This seems redundant
        //
        // Props that need to be in `state` are
        // `value`, `src` and `color`

        for (var prop in sourcePropTypes) {
          needsUpdate = needsUpdate || prevProps[prop] !== this.props[prop];
        }

        if (needsUpdate) setTimeout(this.fetch, 0);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        if (this.state.internal) {
          this.state.internal.active = false;
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            children = _this$props.children,
            propertyName = _this$props.propertyName;
        var _this$state = this.state,
            src = _this$state.src,
            value = _this$state.value,
            color = _this$state.color,
            sourceName = _this$state.sourceName,
            internal = _this$state.internal;
        var avatarData = {
          src: src,
          value: value,
          color: color,
          sourceName: sourceName,
          onRenderFailed: function onRenderFailed() {
            return internal && internal.fetch();
          } // eslint-disable-line

        };
        if (typeof children === 'function') return children(avatarData);
        var child = React.Children.only(children);
        return /*#__PURE__*/React.cloneElement(child, _defineProperty({}, propertyName, avatarData));
      }
    }]);

    return AvatarDataProvider;
  }(PureComponent);

  _defineProperty(AvatarDataProvider, "displayName", 'AvatarDataProvider');

  _defineProperty(AvatarDataProvider, "propTypes", _objectSpread(_objectSpread({}, sourcePropTypes), {}, {
    cache: PropTypes.object,
    propertyName: PropTypes.string
  }));

  _defineProperty(AvatarDataProvider, "defaultProps", {
    propertyName: 'avatar'
  });

  _defineProperty(AvatarDataProvider, "Cache", Cache);

  _defineProperty(AvatarDataProvider, "ConfigProvider", ConfigProvider);

  return _Object$assign(withConfig(AvatarDataProvider), {
    ConfigProvider: ConfigProvider,
    Cache: Cache
  });
}