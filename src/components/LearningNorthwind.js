'use client'

import React from 'react';

export default class LearningNorthwind extends React.Component {
  constructor(props) {
    super(props);

    this.max = 10;

    this.state = {
      progress: 0,
      current: 0
    }
  };

  getTaskTop(title) {
    return (
      <div className="task-top">
        <button onClick={() => this.handleChange(-1)}>
          Prev
        </button>
        <div className="task-title">
          {title}
        </div>
        <button onClick={() => this.handleChange(1)}>
          Next
        </button>
      </div>
    )
  }

  c(code) {
    let arr = code.split(" ");
    return (
      <code>{arr.map((x, index) => 
        x.startsWith("_") ? 
          <span className="unhighlight">
            {
              index == arr.length - 1 ?
                x.substring(1)
              :
                x.substring(1) + " "
            }
          </span>
        :
          index == arr.length - 1 ?
            x
          :
            x + " "
      )}</code>
    )
  }

  getTask() {
    if (this.state.current == 0)
      return (
        <>
          {this.getTaskTop("Simple Querying")}
          <div className="task-tutorial">
            In SQL, you can use the {this.c("SELECT")} statement to query data from a table. 
            The basic syntax of a select query is {this.c("SELECT _columns FROM _some_table")}.
            Use {this.c("*")} as the column to select all columns. You can select multiple column names by seperating the columns with commas.
          </div>
          <div className="task-try-it">Try it:</div>
          <div className="task">
            <span className="task-number">1. </span> Select all columns from the Customer table.
          </div>
          <div className="task">
            <span className="task-number">2. </span> In one {this.c("SELECT")} statement, select the first and last names of all employees.
          </div>
        </>
      )
    else if (this.state.current == 1)
      return (
        <>
          {this.getTaskTop("Simple Querying 2")}
          <div className="task-tutorial">
            In SQL, you can use the <code>SELECT</code> statement to query data from a table. The basic syntax of a select query is 
          </div>
          <div className="task">
            <span className="task-number">1. </span> Select all columns from the Customer table.
          </div>
          <div className="task">
            <span className="task-number">2. </span> Select all columns from the Customer table.
          </div>
        </>
      )
    else
      return <></>
  }

  handleChange(increment) {
    let newValue = this.state.current + increment;
    if (newValue >= 0 && newValue < this.max) {
      this.setState({current: newValue});
    }
  }

  render() {
    return (
      <>
        <div className="task-container">
          {this.getTask()}
        </div>
        <div className="padding-element" />
      </>
    );
  }

}
