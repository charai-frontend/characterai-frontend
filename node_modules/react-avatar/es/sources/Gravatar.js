'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import PropTypes from 'prop-types';
import md5 from 'md5';
import { getImageSize } from '../utils';

var GravatarSource = /*#__PURE__*/_createClass(function GravatarSource(_props) {
  var _this = this;

  _classCallCheck(this, GravatarSource);

  _defineProperty(this, "props", null);

  _defineProperty(this, "isCompatible", function () {
    return !!_this.props.email || !!_this.props.md5Email;
  });

  _defineProperty(this, "get", function (setState) {
    var props = _this.props;
    var email = props.md5Email || md5(props.email);
    var size = getImageSize(props.size);
    var url = "https://secure.gravatar.com/avatar/".concat(email, "?d=404");
    if (size) url += "&s=".concat(size);
    setState({
      sourceName: 'gravatar',
      src: url
    });
  });

  this.props = _props;
});

_defineProperty(GravatarSource, "propTypes", {
  email: PropTypes.string,
  md5Email: PropTypes.string
});

export { GravatarSource as default };