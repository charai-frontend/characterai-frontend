'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _concatInstanceProperty from "core-js-pure/stable/instance/concat.js";
import PropTypes from 'prop-types';
import { getImageSize } from '../utils';
export default function createRedirectSource(network, property) {
  var _class;

  return _class = /*#__PURE__*/_createClass(function AvatarRedirectSource(props) {
    var _this = this;

    _classCallCheck(this, AvatarRedirectSource);

    _defineProperty(this, "props", null);

    _defineProperty(this, "isCompatible", function () {
      return !!_this.props.avatarRedirectUrl && !!_this.props[property];
    });

    _defineProperty(this, "get", function (setState) {
      var _context, _context2, _context3;

      var avatarRedirectUrl = _this.props.avatarRedirectUrl;
      var size = getImageSize(_this.props.size);
      var baseUrl = avatarRedirectUrl.replace(/\/*$/, '/');
      var id = _this.props[property];
      var query = size ? "size=".concat(size) : '';

      var src = _concatInstanceProperty(_context = _concatInstanceProperty(_context2 = _concatInstanceProperty(_context3 = "".concat(baseUrl)).call(_context3, network, "/")).call(_context2, id, "?")).call(_context, query);

      setState({
        sourceName: network,
        src: src
      });
    });

    this.props = props;
  }), _defineProperty(_class, "propTypes", _defineProperty({}, property, PropTypes.oneOfType([PropTypes.string, PropTypes.number]))), _class;
}