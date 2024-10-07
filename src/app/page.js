'use client';

import React from 'react';
import Header from '@/components/Header'


export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {  
      loggedIn: false,
      darkTheme: true,
    };
  }

  componentDidMount() {
    var storage = window.localStorage;
    var html = document.querySelector('html');
    if (storage.getItem('darkTheme') == null) {
      storage.setItem('darkTheme', "true")
    } else {
      this.setState({darkTheme: JSON.parse(storage.getItem('darkTheme').toLowerCase())}, () => {
        html.setAttribute('theme', this.state.darkTheme ? "dark": "light");
      });
    }
  }

  render() {
    return (
      <div className="main">
        <Header 
          loggedIn={this.state.loggedIn}
          updateTheme={(isDark, callback=Function()) => {
            this.setState({darkTheme: isDark}, () => {
              callback();
            });
          }}
          updateLoggedIn={(isLoggedIn, callback=Function()) => {
            this.setState({loggedIn: isLoggedIn}, () => {
              callback();
            });
          }}
          theme={this.state.darkTheme}
        />
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
            <div className="subtitle">New to SQL?</div>
            <p className="explanation">
              Start learning SQL by creating a template repository and using our learning features.
            </p>
          </div>
        </div>
      </div>
    )
  }

}
