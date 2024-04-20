'use client';

import React from 'react';
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
            <div className="title">Welcome!</div>
            <p className="explanation">
              SandboxSQL is a online SQL editor and compiler where you can write and execute SQLite queries online.
              <br/><br/>
              You can use the template databases to learn, practice, or test queries. 
              <br/><br/>
              Start by creating a new database or loading an existing one.
            </p>
          </div>
        </div>
      </div>
    )
  }

}
