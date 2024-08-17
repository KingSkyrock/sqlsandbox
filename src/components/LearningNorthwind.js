'use client'

import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default class LearningNorthwind extends React.Component {
  constructor(props) {
    super(props);

    this.max = 2;

    this.state = {
      progress: 0,
      current: 0,
      tasks: [[0,0],[0,0,0],[0,0,0]]
    }
  };

  completeTask(taskCoord) {
    this.state.tasks[taskCoord[0]][taskCoord[1]] = 1;
    this.setState({progress: this.state.tasks[taskCoord[0]].every(val => val == 1) ? this.state.progress + 1 : this.state.progress });
    toast.success("Task complete!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: this.props.theme,
    });
  }

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
            Use {this.c("_*")} as the column to select all columns. You can select multiple column names by seperating the columns with commas.
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
          <div className="task-tutorial">
            SQL has certain reserved keywords like {this.c("ORDER")}. If you try querying from the Order table, you need to surround Order with double quotes. 
            The {this.c("ORDER")} keyword is part of the {this.c("ORDER BY")} clause, which is used for retrieving rows in a specified order.
            In a select statement, {this.c("ORDER BY")} comes after the table name. 
            For example, {this.c("SELECT _* FROM _Employee ORDER BY _HireDate ASC")} retrieves employees by their hire date. {" "}
            {this.c("ASC")}  means an ascending order while {this.c("DESC")} means a descending order.
          </div>
          <div className="task-try-it">Try it:</div>
          <div className="task">
            <span className="task-number">{this.state.tasks[1][0] ? "✓" : "1. "}</span>
            <span className={this.state.tasks[1][0] ? "completed" : ""}>
              Select all columns from the Order table.
            </span>
          </div>
          <div className="task">
            <span className="task-number">{this.state.tasks[1][1] ? "✓" : "2. "}</span>
            <span className={this.state.tasks[1][1] ? "completed" : ""}>
              Select all columns from the Employee table and order them by birth date in a ascending order.
            </span>
          </div>
          <div className="task">
            <span className="task-number">{this.state.tasks[1][2] ? "✓" : "3. "}</span>
            <span className={this.state.tasks[1][2] ? "completed" : ""}>
              Select all columns from the Employee table and order them by birth date in a descending order.
            </span>
          </div>
        </>
      )
      else if (this.state.current == 2)
        return (
          <>
            {this.getTaskTop("Querying With Filters")}
            <div className="task-tutorial">
              Use {this.c("SELECT DISTINCT")} to query without duplicates. You can use the {this.c("WHERE")} clause with various logical operators to specify a condition for your query.
              {" "} {this.c("WHERE")} always comes before {this.c("ORDER")}. Here is an example for finding all German customers. {this.c("SELECT * FROM _Customer WHERE _Country = \"Germany\"")}.
              The logical operators {this.c("AND")} and {this.c("OR")} can be used to tune your querying. The following example finds all customers who are German or British: {this.c("SELECT * FROM _Customer WHERE _Country = \"Germany\" OR _Country = \"UK\"")}.
            </div>
            <div className="task-try-it">Try it:</div>
            <div className="task">
              <span className="task-number">{this.state.tasks[2][0] ? "✓" : "1. "}</span>
              <span className={this.state.tasks[2][0] ? "completed" : ""}>
                Select just addresses from the Employee table if they are from the USA.
              </span>
            </div>
            <div className="task">
              <span className="task-number">{this.state.tasks[2][1] ? "✓" : "2. "}</span>
              <span className={this.state.tasks[2][1] ? "completed" : ""}>
                Select all columns from the Customer table if they are a sales representative or a sales manager and order them by city in ascending order (alphabetical). 
              </span>
            </div>
            <div className="task">
              <span className="task-number">{this.state.tasks[2][2] ? "✓" : "3. "}</span>
              <span className={this.state.tasks[2][2] ? "completed" : ""}>
                Select all distinct unit prices from the Product table if the unit price is between 10 and 20. Hint: Use {this.c("WHERE _column BETWEEN _lower_number AND _upper_number")}.
              </span>
            </div>
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
    axios.post('/api/skip_learning', {id: this.props.currentProjectId}, {withCredentials: true}).then((res) => {
      this.state.tasks[this.state.current] = new Array(this.state.tasks[this.state.current].length).fill(1);
      this.setState({progress: this.state.progress + 1}, () => this.handleChange(1));
      toast.info("Tasks skipped", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: this.props.theme,
      });
    })
    .catch((error) => {
      alert(error)
    });
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
    });
  }

  render() {
    return (
      <>
        <ToastContainer />
        <div className="task-container">
          {this.getTaskContainer()}
          {this.state.current == this.state.progress && this.state.current != this.max &&
            <button className="skip-button" onClick={() => this.handleSkip()}>Skip</button>
          }
        </div>
        <div className="padding-element" />
      </>
    );
  }
}

LearningNorthwind.propTypes = {
  theme: PropTypes.string,
  currentProjectId: PropTypes.string,
};
