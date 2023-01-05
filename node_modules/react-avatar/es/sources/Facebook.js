'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _concatInstanceProperty from "core-js-pure/stable/instance/concat.js";
import PropTypes from 'prop-types';
import { getImageSize } from '../utils';

var FacebookSource = /*#__PURE__*/_createClass(function FacebookSource(props) {
  var _this = this;

  _classCallCheck(this, FacebookSource);

  _defineProperty(this, "props", null);

  _defineProperty(this, "isCompatible", function () {
    return !!_this.props.facebookId;
  });

  _defineProperty(this, "get", function (setState) {
    var _context;

    var facebookId = _this.props.facebookId;
    var size = getImageSize(_this.props.size);
    var url = "https://graph.facebook.com/".concat(facebookId, "/picture");
    if (size) url += _concatInstanceProperty(_context = "?width=".concat(size, "&height=")).call(_context, size);
    setState({
      sourceName: 'facebook',
      src: url
    });
  });

  this.props = props;
});

_defineProperty(FacebookSource, "propTypes", {
  facebookId: PropTypes.string
});

export { FacebookSource as default };