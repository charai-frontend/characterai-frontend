'use strict';

import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _indexOfInstanceProperty from "core-js-pure/stable/instance/index-of.js";
import _mapInstanceProperty from "core-js-pure/stable/instance/map.js";
import _reduceInstanceProperty from "core-js-pure/stable/instance/reduce.js";
import _parseFloat from "core-js-pure/stable/parse-float.js";
import _sliceInstanceProperty from "core-js-pure/stable/instance/slice.js";
import _filterInstanceProperty from "core-js-pure/stable/instance/filter.js";
import retina from 'is-retina';
var IS_RETINA = retina();
export function fetch(url, successCb, errorCb) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status === 200) {
        var data = JSON.parse(request.responseText);
        successCb(data);
      } else {
        errorCb(request.status);
      }
    }
  };

  request.open('GET', url, true);
  request.send();
}
export function fetchJSONP(url, successCb, errorCb) {
  var callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
  var script = document.createElement('script');
  script.src = url + (_indexOfInstanceProperty(url).call(url, '?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
  document.body.appendChild(script);

  script.onerror = function () {
    errorCb();
  };

  window[callbackName] = function (data) {
    delete window[callbackName];
    document.body.removeChild(script);
    successCb(data);
  };
} // https://webaim.org/resources/contrastchecker/

export var defaultColors = ['#A62A21', '#7e3794', '#0B51C1', '#3A6024', '#A81563', '#B3003C']; // https://regex101.com/r/YEsPER/1
// https://developer.mozilla.org/en-US/docs/Web/CSS/length

var reSize = /^([-+]?(?:\d+(?:\.\d+)?|\.\d+))([a-z]{2,4}|%)?$/; // https://en.wikipedia.org/wiki/Linear_congruential_generator

function _stringAsciiPRNG(value, m) {
  var _context;

  // Xn+1 = (a * Xn + c) % m
  // 0 < a < m
  // 0 <= c < m
  // 0 <= X0 < m
  var charCodes = _mapInstanceProperty(_context = _toConsumableArray(value)).call(_context, function (letter) {
    return letter.charCodeAt(0);
  });

  var len = charCodes.length;
  var a = len % (m - 1) + 1;
  var c = _reduceInstanceProperty(charCodes).call(charCodes, function (current, next) {
    return current + next;
  }) % m;
  var random = charCodes[0] % m;

  for (var i = 0; i < len; i++) {
    random = (a * random + c) % m;
  }

  return random;
}

export function getRandomColor(value) {
  var colors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultColors;
  // if no value is passed, always return transparent color otherwise
  // a rerender would show a new color which would will
  // give strange effects when an interface is loading
  // and gets rerendered a few consequent times
  if (!value) return 'transparent'; // value based random color index
  // the reason we don't just use a random number is to make sure that
  // a certain value will always get the same color assigned given
  // a fixed set of colors

  var colorIndex = _stringAsciiPRNG(value, colors.length);

  return colors[colorIndex];
}
export function parseSize(size) {
  size = '' + size;

  var _ref = reSize.exec(size) || [],
      _ref2 = _slicedToArray(_ref, 3),
      _ref2$ = _ref2[1],
      value = _ref2$ === void 0 ? 0 : _ref2$,
      _ref2$2 = _ref2[2],
      unit = _ref2$2 === void 0 ? 'px' : _ref2$2;

  return {
    value: _parseFloat(value),
    str: value + unit,
    unit: unit
  };
}
/**
 * Calculate absolute size in pixels we want for the images
 * that get requested from the various sources. They don't
 * understand relative sizes like `em` or `vww`.  We select
 * a fixed size of 512px when we can't detect the true pixel size.
 */

export function getImageSize(size) {
  size = parseSize(size);
  if (isNaN(size.value)) // invalid size, use fallback
    size = 512;else if (size.unit === 'px') // px are good, use them
    size = size.value;else if (size.value === 0) // relative 0 === absolute 0
    size = 0;else // anything else is unknown, use fallback
    size = 512;
  if (IS_RETINA) size = size * 2;
  return size;
}
export function defaultInitials(name, _ref3) {
  var _context2, _context3, _context4;

  var maxInitials = _ref3.maxInitials;
  return _sliceInstanceProperty(_context2 = _filterInstanceProperty(_context3 = _mapInstanceProperty(_context4 = name.split(/\s/)).call(_context4, function (part) {
    return part.substring(0, 1).toUpperCase();
  })).call(_context3, function (v) {
    return !!v;
  })).call(_context2, 0, maxInitials).join('').toUpperCase();
}
/**
 * Grouped timeouts reduce the amount of timeouts trigged
 * by grouping multiple handlers into a single setTimeout call.
 *
 * This reduces accuracy of the timeout but will be less expensive
 * when multiple avatar have been loaded into view.
 */

var timeoutGroups = {};
export function setGroupedTimeout(fn, ttl) {
  if (timeoutGroups[ttl]) {
    timeoutGroups[ttl].push(fn);
    return;
  }

  var callbacks = timeoutGroups[ttl] = [fn];
  setTimeout(function () {
    delete timeoutGroups[ttl];
    callbacks.forEach(function (cb) {
      return cb();
    });
  }, ttl);
}
export function getNullableText() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  for (var _i = 0, _args = args; _i < _args.length; _i++) {
    var arg = _args[_i];
    if (arg) return arg;
    if (arg === false || arg === null) return null;
  }

  return;
}
export function calculateBorderRadius(round) {
  if (round === true) return '100%';
  if (round === false) return;
  return round;
}