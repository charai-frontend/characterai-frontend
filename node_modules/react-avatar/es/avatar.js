'use strict';

import _extends from "@babel/runtime/helpers/extends";
import _Object$assign from "core-js-pure/stable/object/assign.js";
import React from 'react';
import { Cache } from './cache';
import { withConfig, ConfigProvider } from './context';
import createAvatarDataProvider from './data-provider';
import { getRandomColor } from './utils';
import Image from './components/image';
import Text from './components/text';
export { getRandomColor } from './utils';
export { ConfigProvider } from './context';
export { Cache } from './cache';
export default function createAvatarComponent(options) {
  var DataProvider = createAvatarDataProvider(options);
  var Component = withConfig(
  /*#__PURE__*/
  // eslint-disable-next-line react/display-name
  React.forwardRef(function (props, ref) {
    return /*#__PURE__*/React.createElement(DataProvider, _extends({}, props, {
      propertyName: "avatar"
    }), function (avatar) {
      var Avatar = avatar.src ? Image : Text;
      return /*#__PURE__*/React.createElement(Avatar, _extends({}, props, {
        avatar: avatar,
        ref: ref
      }));
    });
  }));
  return _Object$assign(Component, {
    getRandomColor: getRandomColor,
    ConfigProvider: ConfigProvider,
    Cache: Cache
  });
}