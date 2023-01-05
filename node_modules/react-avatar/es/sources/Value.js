'use strict';

import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import PropTypes from 'prop-types';
import { getRandomColor, defaultInitials } from '../utils';

var ValueSource = /*#__PURE__*/function () {
  function ValueSource(props) {
    var _this = this;

    _classCallCheck(this, ValueSource);

    _defineProperty(this, "props", null);

    _defineProperty(this, "isCompatible", function () {
      return !!(_this.props.name || _this.props.value || _this.props.email);
    });

    _defineProperty(this, "get", function (setState) {
      var value = _this.getValue();

      if (!value) return setState(null);
      setState({
        sourceName: 'text',
        value: value,
        color: _this.getColor()
      });
    });

    this.props = props;
  }

  _createClass(ValueSource, [{
    key: "getInitials",
    value: function getInitials() {
      var _this$props = this.props,
          name = _this$props.name,
          initials = _this$props.initials;
      if (typeof initials === 'string') return initials;
      if (typeof initials === 'function') return initials(name, this.props);
      return defaultInitials(name, this.props);
    }
  }, {
    key: "getValue",
    value: function getValue() {
      if (this.props.name) return this.getInitials();
      if (this.props.value) return this.props.value;
      return null;
    }
  }, {
    key: "getColor",
    value: function getColor() {
      var _this$props2 = this.props,
          color = _this$props2.color,
          colors = _this$props2.colors,
          name = _this$props2.name,
          email = _this$props2.email,
          value = _this$props2.value;
      var colorValue = name || email || value;
      return color || getRandomColor(colorValue, colors);
    }
  }]);

  return ValueSource;
}();

_defineProperty(ValueSource, "propTypes", {
  color: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  email: PropTypes.string,
  maxInitials: PropTypes.number,
  initials: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
});

export { ValueSource as default };