'use strict';

import _createClass from "@babel/runtime/helpers/createClass";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import PropTypes from 'prop-types';
import { getImageSize } from '../utils';

var GithubSource = /*#__PURE__*/_createClass(function GithubSource(props) {
  var _this = this;

  _classCallCheck(this, GithubSource);

  _defineProperty(this, "props", null);

  _defineProperty(this, "isCompatible", function () {
    return !!_this.props.githubHandle;
  });

  _defineProperty(this, "get", function (setState) {
    var githubHandle = _this.props.githubHandle;
    var size = getImageSize(_this.props.size);
    var url = "https://avatars.githubusercontent.com/".concat(githubHandle, "?v=4");
    if (size) url += "&s=".concat(size);
    setState({
      sourceName: 'github',
      src: url
    });
  });

  this.props = props;
});

_defineProperty(GithubSource, "propTypes", {
  githubHandle: PropTypes.string
});

export { GithubSource as default };