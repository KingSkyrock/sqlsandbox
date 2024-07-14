'use client';

import React from 'react';
import TableCell from '@/components/TableCell';
import ValuesDisplay from '@/components/ValuesDisplay';
import Header from '@/components/Header';
import LearningNorthwind from '@/components/LearningNorthwind';
import axios from 'axios';
import { Parser } from 'node-sql-parser/build/mysql';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { tokyoNightDay } from '@uiw/codemirror-theme-tokyo-night-day';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import 'overlayscrollbars/overlayscrollbars.css';
import ToolbarButton from '@/components/ToolbarButton';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.parser = new Parser();
    this.editor = React.createRef();
    this.toolbar = React.createRef();
    this.learningNorthwind = React.createRef();
    this.running = false;

    this.state = {
      currentProjectId: null,
      keys: [],
      values: [],
      valueAmount: 0,
      tables: [],
      openTable: null,
      sql: "SELECT * FROM",
      currentToolbar: 1, 
      error: "",
      ranSuccessfully: false,
      darkTheme: true,
      loggedIn: false,
    }; 
  }

  render() {
    return (
      <div className="main">
        <Header 
          projectId={this.state.currentProjectId}
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
        <PanelGroup className="content-container" direction="horizontal">
          <Panel className="tables-container" defaultSize={15} minSize={6}>
            <OverlayScrollbarsComponent defer className="tables" options={{overflow: {x: 'hidden'}}}>
              <div className="tables-top" >Tables</div>
              {this.state.tables.map((table) => {
                return (
                  <TableCell
                    name={table.name}
                    key={table.name}
                    id={this.state.currentProjectId}
                    open={this.state.openTable == table.name}
                    select={(name) => {
                      this.setState({openTable: name});
                    }}
                  />
                )
              })}
            </OverlayScrollbarsComponent>
          </Panel>
          <PanelResizeHandle className="resize-handle-vertical"/>
          <Panel defaultSize={80} minSize={20} className="content-area">
            <PanelGroup direction="vertical">
              <Panel defaultSize={59} minSize={20}>
                <OverlayScrollbarsComponent defer className="rows">
                  {this.state.keys &&
                    <ValuesDisplay keys={this.state.keys} values={this.state.values} valueAmount={this.state.valueAmount}  />
                  }
                </OverlayScrollbarsComponent>
              </Panel>
              <PanelResizeHandle className="resize-handle-horizontal"/>
              <Panel ref={this.toolbar} defaultSize={21} minSize={5} className="toolbar">
                <div className="toolbar-buttons">
                  <button className="toolbar-execute-button" onClick={() => this.runSQL(this.state.sql)}>
                    {this.state.ranSuccessfully ?
                      <>Success!</>
                    :
                      <>Execute</>
                    }
                  </button>
                  <ToolbarButton 
                    id={1}
                    currentlySelected={this.state.currentToolbar}
                    name="Info"
                    select={(id) => this.handleToolbarSelect(id)}
                  />
                  <ToolbarButton 
                    id={2}
                    currentlySelected={this.state.currentToolbar}
                    name="Error"
                    select={(id) => this.handleToolbarSelect(id)}
                  />
                  {this.props.params.uuid.endsWith("-l") &&
                    <ToolbarButton 
                      id={3}
                      currentlySelected={this.state.currentToolbar}
                      name="Learn"
                      select={(id) => this.handleToolbarSelect(id)}
                    />
                  }
                </div>
                <OverlayScrollbarsComponent defer className="toolbar-body">
                  {this.state.currentToolbar == 1 ?
                    <>
                      <div className="info-title">Welcome to SandboxSQL!</div>
                      <div className="info-text">
                        Start by typing in a SQLite query to the code editor below. <br/>
                        Click execute button to run the query and the results will be displayed in the section above. <br/>
                        You can resize sections to your liking by clicking and dragging on the borders. <br/>
                        {this.props.params.uuid.endsWith("-l") &&
                          <><br />Head over to the learn tab to start learning.</>
                        }
                      </div>
                    </>
                  : this.state.currentToolbar == 2 ?
                    <>
                      {this.state.error != "" ?
                        <>
                          <div>Error!</div>
                          <div className="error-message">
                            {this.state.error}
                          </div>
                        </>
                        :
                        <>
                          Errors will appear here. Currently, there are no errors!
                        </>
                      }
                    </>
                  : this.state.currentToolbar == 3 &&
                    <>
                      <div className="info-title">Learn</div>
                      <div className="info-text">
                        <div className="info-top-text">Use SandboxSQL to learn SQL with hands-on challenges and AI assistance.</div> 
                        {this.state.loggedIn ?
                          <>
                            Welcome! Now you can start learning the basics of SQL. This special learning template uses the Northwind template database, which mimics a small business.
                            Begin by following the instructions below. You can ask for AI assistance if you are stuck!
                          </>
                        :
                          <>Sign-in to continue using our learning features!</>
                        }
                      </div>
                      {this.state.loggedIn &&
                        <>
                          <LearningNorthwind 
                            ref={this.learningNorthwind}
                            theme={this.state.darkTheme ? "dark" : "light"}
                            currentProjectId={this.state.currentProjectId}
                          />
                        </>
                      }
                    </>
                  }
                </OverlayScrollbarsComponent>
              </Panel>
              <PanelResizeHandle className="resize-handle-horizontal"/>
              <Panel defaultSize={20} minSize={5} className="input-container">
                {this.state.currentProjectId &&
                  <div defer className="editor">
                    <CodeMirror
                      height="100%"
                      value={this.state.sql}
                      extensions={[sql()]}
                      theme={this.state.darkTheme ? tokyoNight : tokyoNightDay}
                      onChange={(value) => {
                        this.setState({sql: value})
                      }}
                    />
                  </div>
                }
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    );
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
    document.addEventListener("keydown", (evt)=>{this.keyShortcuts(evt)}, false);
    var regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}(-l)?$/i; //uuidv4
    if (regex.test(this.props.params.uuid)) {
      axios.post('/api/startsql', {id: this.props.params.uuid}, {}).then((res) => {
        this.setState({
          currentProjectId: this.props.params.uuid,
          tables: res.data.tables
        });
      })
      .catch((error) => {
        alert(error)
      })
    }
  }

  keyShortcuts(evt) {
    if (evt.keyCode === 13 && evt.ctrlKey) {
      evt.stopPropagation();
      evt.preventDefault();
      this.runSQL(this.state.sql);
    }
  }

  handleToolbarSelect(id) {
    this.setState({currentToolbar: id});
    if (this.toolbar.current.getSize() < 12) {
      this.toolbar.current.resize(12);
    }
  }

  runSQL(code) {
    !this.running &&
    this.setState({error: ""}, () => {
      var codearray = code.split(";")
      for (var h = 0; h < codearray.length; h++) {
        if (codearray[h] == "" || codearray[h] == " " || codearray[h] == "\n") {
          codearray.splice(h, 1)
        }
      }
      for (var h = 0; h < codearray.length; h++) {
        if (codearray[h] != undefined) {
          this.running = true;
          axios.post('/api/runsql', {code: codearray[h], id: this.state.currentProjectId}, {withCredentials: true})
            .then((res) => {
              if (res.data.completed_task) {
                this.learningNorthwind.current.completeTask(res.data.completed_task);
              }
              var keys;
              var valueAmount;
              if (res.data.rows.length == 0) {
                keys = [];
                valueAmount = 0;
                // If no rows, it could've been a modification to the table schema
                axios.post('/api/startsql', {id: this.state.currentProjectId}, {}).then((res) => {
                  this.setState({
                    tables: res.data.tables
                  });
                })
                .catch((error) => {
                  alert(error)
                })
              } else {
                keys = Object.keys(res.data.rows[0]);
                valueAmount = Object.keys(res.data.rows[0]).length;
              }
              var values = [];
              var valuesData = [];
              var counter = 0;
              var arr = [];
              for (var i = 0; i < res.data.rows.length; i++) {
                for (var j = 0; j < Object.keys(res.data.rows[i]).length; j++) {
                  values.push(res.data.rows[i][Object.keys(res.data.rows[i])[j]]);
                }
              }
              for(var i = 0; i < values.length; i++) {
                counter += 1
                if (counter >= Object.keys(res.data.rows[0]).length) {
                  arr.push(values[i])
                  counter = 0;
                  valuesData.push(arr);
                  arr = []
                } else {
                  arr.push(values[i])
                }
              }
              this.running = false;
              this.setState(
                {
                  keys: keys, 
                  values: valuesData, 
                  valueAmount: valueAmount, 
                  sql: window.localStorage.getItem('autoClear') == 'true' ? "" : this.state.sql,
                  ranSuccessfully: true,
                },
                () => setTimeout(() => {
                  this.setState({ranSuccessfully: false})
                }, 1000)
              );
            })
            .catch((error) => {
              this.running = false;
              if (error.response && !error.response.data.error.message.includes("not an error")) {
                this.setState({error: error.response.data.error.message}, () => {
                  this.handleToolbarSelect(2);
                })
              }
            })
        }
      }
    })
  }
}

