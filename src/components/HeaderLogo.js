'use client'

import React from 'react';
import Image from 'next/image';
import logo from '@/assets/sandboxsqllogo.svg';

export default class HeaderLogo extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <>
        <Image
          src={logo}
          className="header-logo"
          alt="Sandbox SQL"
        />
        <div className="header-text">SandboxSQL</div>
      </>
    );
  }

}
