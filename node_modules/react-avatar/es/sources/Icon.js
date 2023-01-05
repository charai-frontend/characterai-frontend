'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import PropTypes from 'prop-types';
import { getRandomColor } from '../utils';

var IconSource = /*#__PURE__*/_createClass(function IconSource(props) {
  var _this = this;

  _classCallCheck(this, IconSource);

  _defineProperty(this, "props", null);

  _defineProperty(this, "icon", '✷');

  _defineProperty(this, "isCompatible", function () {
    return true;
  });

  _defineProperty(this, "get", function (setState) {
    var _this$props = _this.props,
        color = _this$props.color,
        colors = _this$props.colors;
    setState({
      sourceName: 'icon',
      value: _this.icon,
      color: color || getRandomColor(_this.icon, colors)
    });
  });

  this.props = props;
});

_defineProperty(IconSource, "propTypes", {
  color: PropTypes.string
});

export { IconSource as default };