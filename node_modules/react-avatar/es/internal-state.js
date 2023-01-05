import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";

var InternalState = /*#__PURE__*/function () {
  function InternalState() {
    _classCallCheck(this, InternalState);

    this.sourcePointer = 0;
    this.active = true;
    this.fetch = null;
  }

  _createClass(InternalState, [{
    key: "isActive",
    value: function isActive() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // Internal state has been reset => we received new props
      if (state.internal !== this) return false;
      if (!this.fetch) return false;
      if (this.active !== true) return false;
      return true;
    }
  }]);

  return InternalState;
}();

export { InternalState as default };