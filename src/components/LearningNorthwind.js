'use client'

import React from 'react';
import axios from 'axios';

export default class LearningNorthwind extends React.Component {
  constructor(props) {
    super(props);

    this.max = 1;

    this.state = {
      progress: 0,
      current: 0,
      tasks: [[0,0]]
    }
  };

  getTaskTop(title) {
    return (
      <div className="task-top">
        {this.state.current != 0 ?
          <button onClick={() => this.handleChange(-1)}>
            Prev
          </button>
        :
        <button className="disabled">
          Prev
        </button>
        }
        <div className="task-title">
          {title}
        </div>
        {this.state.current != this.max && this.state.current < this.state.progress?
          <button onClick={() => this.handleChange(1)}>
            Next
          </button>
        :
        <button className="disabled">
          Next
        </button>
        }
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

  getTaskContainer() {
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
            <span className="task-number">{this.state.tasks[0][0] ? "✓" : "1. "}</span>
            <span className={this.state.tasks[0][0] ? "completed" : ""}>
              Select all columns from the Customer table.
            </span>
          </div>
          <div className="task">
            <span className="task-number">{this.state.tasks[0][1] ? "✓" : "2. "}</span>
            <span className={this.state.tasks[0][1] ? "completed" : ""}>
              In one {this.c("SELECT")} statement, select the first and last names of all employees.
            </span>
          </div>
        </>
      )
    else if (this.state.current == 1)
      return (
        <>
          {this.getTaskTop("Simple Querying 2")}
        </>
      )
    else
      return <></>
  }

  handleChange(increment) {
    let newValue = this.state.current + increment;
    if (newValue >= 0 && newValue <= this.max && newValue <= this.state.progress + 1) {
      this.setState({current: newValue});
      if (newValue == this.state.progress + 1) {
        this.setState({progress: newValue});
      }
    }
  }

  handleSkip() {
    this.state.tasks[this.state.current] = new Array(this.state.tasks[this.state.current].length).fill(1);
    this.setState({progress: this.state.progress + 1}, () => this.handleChange(1))
  }

  componentDidMount() {
    axios.post('/api/get_learning_progress', {withCredentials: true}).then((res) => {
      this.setState({
        progress: res.data.progress,
        tasks: JSON.parse(res.data.tasks)
      });
      })
    .catch((error) => {
      alert(error)
    })
  }

  render() {
    return (
      <>
        <div className="task-container">
          {this.getTaskContainer()}
          {this.state.current == this.state.progress && this.current != this.max &&
            <button className="skip-button" onClick={() => this.handleSkip()}>Skip</button>
          }
        </div>
        <div className="padding-element" />
      </>
    );
  }

}
