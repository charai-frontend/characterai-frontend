'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import PropTypes from 'prop-types';

var SrcSource = /*#__PURE__*/_createClass(function SrcSource(props) {
  var _this = this;

  _classCallCheck(this, SrcSource);

  _defineProperty(this, "props", null);

  _defineProperty(this, "isCompatible", function () {
    return !!_this.props.src;
  });

  _defineProperty(this, "get", function (setState) {
    setState({
      sourceName: 'src',
      src: _this.props.src
    });
  });

  this.props = props;
});

_defineProperty(SrcSource, "propTypes", {
  src: PropTypes.string
});

export { SrcSource as default };