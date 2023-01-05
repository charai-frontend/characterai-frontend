import React from 'react';

import darkLogo from '../logo-dark.png';
import logo from '../logo.png';

type LogoProps = {
  style?: { [key: string]: string | number };
};

const Logo = ({ style = {} }: LogoProps) => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  return (
    <img
      className="img-fluid mt-3 mb-3"
      style={{
        minHeight: '20px',
        maxHeight: '45px',
        maxWidth: '77%',
        width: 'auto',
        ...style,
      }}
      src={isDark ? darkLogo : logo}
      alt="logo"
    />
  );
};

export default Logo;
