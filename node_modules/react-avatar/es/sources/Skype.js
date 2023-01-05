'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import PropTypes from 'prop-types';

var SkypeSource = /*#__PURE__*/_createClass(function SkypeSource(props) {
  var _this = this;

  _classCallCheck(this, SkypeSource);

  _defineProperty(this, "props", null);

  _defineProperty(this, "isCompatible", function () {
    return !!_this.props.skypeId;
  });

  _defineProperty(this, "get", function (setState) {
    var skypeId = _this.props.skypeId;
    var url = "https://api.skype.com/users/".concat(skypeId, "/profile/avatar");
    setState({
      sourceName: 'skype',
      src: url
    });
  });

  this.props = props;
});

_defineProperty(SkypeSource, "propTypes", {
  skypeId: PropTypes.string
});

export { SkypeSource as default };