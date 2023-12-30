'use client';

import React from 'react';
const { Parser } = require('node-sql-parser/build/mysql');
import Header from '@/components/Header'


export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="main">
        <Header />
        <div className="home-container">
          <div>
            <div className="title">Welcome</div>
            <div className="subtitle">Create a new database or load an existing one</div>
          </div>
        </div>
      </div>
    )
  }

}
