import React from 'react';
import SelectCell from './SelectCell.js';
import TableCell from './TableCell.js'
import ValuesDisplay from './ValuesDisplay.js'
import './styles.scss';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
//import Parser from 'node-sql-parser';
const { Parser } = require('node-sql-parser/build/mysql');
import 'codemirror/theme/material-palenight.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from 'react-modal';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

const modalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    paddingTop: '20px',
    paddingLeft: '20px',
    border: '0px',
    height: '80%',
    width: '65%',
    minWidth: '350px',
    backgroundColor: '35415E',
    zIndex: 0,
    boxShadow: '0px 10px 20px 5px rgba(0, 0, 0, 0.3)',
  },
  overlay: {
     background: 'rgba(0, 0, 0, 0.3)'
   }
};

const newSqlModal = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    paddingTop: '35px',
    paddingLeft: '45px',
    paddingRight: '45px',
    border: '0px',
    height: '70%',
    width: '35%',
    minWidth: '350px',
    borderRadius: '25px',
    backgroundColor: '35415E',
    zIndex: 0,
    boxShadow: '0px 10px 20px 5px rgba(0, 0, 0, 0.3)',
  },
  overlay: {
     background: 'rgba(0, 0, 0,  0.3)'
   }
};

Modal.setAppElement('#root');
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.updateCheck = React.createRef();
    this.parser = new Parser();

    this.state = {
      currentProjectId: false,
      SQLprojects: false,
      keys: [],
      values: [],
      valueAmount: 0,
      tables: [],
      autoUpdate: true,
      openTable: null,
      sql: "SELECT * FROM",
      settingsOpen: false,
      dummy: 1,
      creatingNew: false,
    };
    this.closeModals = this.closeModals.bind(this);
  }


  closeModals(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState({settingsOpen: false, creatingNew: false, SQLprojects: false});
  }

  render() {
    return (
      <div className="main">
        <div className="header">
          <button className="new-sql" onClick={() => {this.setState({creatingNew: true})}}>New SQL</button>
          <Modal
            isOpen={this.state.creatingNew}
            onRequestClose={this.closeModals}
            style={newSqlModal}
            contentLabel="New project modal"
          >
            <div>
              <div className="modal-title">New SQL Creation</div>
              <div className="modal-subtitle">Create an empty database or use a template</div>
              <br />
              <button className="new-empty" onClick={() => this.startNew(false)}>New empty database</button>
              <button className="new-template" onClick={() => this.startNew(1)}>Northwind Template</button>
              <button className="new-template" onClick={() => this.startNew(2)}>Hospital Template</button>
              <button className="new-template2" onClick={() => this.startNew(3)}>Planet Express Template</button>
            </div>
          </Modal>
          <button className="load-sql" onClick={() => this.loadSQL()}>Load SQL</button>
          <div onClick={() => this.setState({settingsOpen: true})} className="settings">
            <FontAwesomeIcon size="2x" className="icon" color="#d1d5e3" icon={faCog} />
            <Modal
              isOpen={this.state.settingsOpen}
              onRequestClose={this.closeModals}
              style={modalStyle}
              contentLabel="Settings Modal"
            >
              <h1 className="settings-header">Settings</h1>
              <label className="settings-label" htmlFor="autoUpdate">Auto select after modification</label>
              <input onChange={() => {
                this.setState({autoUpdate: !this.state.autoUpdate}, () => {
                  var storage = window.localStorage;
                  if (this.state.autoUpdate == true) {
                    storage.setItem('autoUpdate', "true")
                  } else {
                    storage.setItem('autoUpdate', "false")
                  }
                });

              }} type="checkbox" id="autoUpdate" checked={this.state.autoUpdate} />
            </Modal>
          </div>
        </div>
        <div className="content-container">
          <div className="content-area">
            <div className="rows">
              <SimpleBar>
                {!this.state.currentProjectId &&
                  <div>
                    <div className="title">Welcome</div>
                    <div className="subtitle">Create a new database or load an existing one</div>
                  </div>
                }
                {this.state.keys &&
                  <ValuesDisplay keys={this.state.keys} values={this.state.values} valueAmount={this.state.valueAmount}  />
                }
              </SimpleBar>
            </div>
            <div className="input-container">
              {this.state.currentProjectId &&
                <div className="input-container-again">
                  <div>
                    <button className="run" onClick={() => this.runSQL(this.state.sql)}>Run</button>

                  </div>
                    <div className="editor">
                      <CodeMirror
                        value={this.state.sql}
                        autoCursor={false}
                        options={{
                          mode: 'sql',
                          theme: 'material-palenight',
                          lineNumbers: true
                        }}
                        onChange={(editor, data, value) => {
                          this.setState({sql: value})
                        }}
                      />
                    </div>
                </div>
              }
              {this.state.SQLprojects &&
                <Modal
                  isOpen={this.state.SQLprojects}
                  onRequestClose={this.closeModals}
                  style={newSqlModal}
                  contentLabel="Projects Modal"
                >
                  <div className="modal-title">Load a SQL</div>
                  <div className="modal-subtitle">Select an existing project to load.</div>
                    <div className="projects-list">
                      <SimpleBar>
                        {Object.entries(window.localStorage).map((project) => {
                          return (
                            <SelectCell id={project[1]} name={project[0]} select={(name, id) => {
                              history.replaceState({}, name, "http://localhost:3000/" + id)
                              axios.post('/startsql', {id: id}, {}).then((res) => {
                                this.setState({
                                  currentProjectId: id,
                                  SQLprojects: false,
                                  tables: res.data.tables
                                });
                              })
                              .catch((error) => {
                                alert(error)
                              })
                            }}/>
                          )
                        })}
                      </SimpleBar>
                    </div>
                </Modal>
              }
            </div>
          </div>
          <div className="tables-container">
            <div className="tables">
              <div className="tables-top" >Tables</div>
              <SimpleBar>
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
              </SimpleBar>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    var storage = window.localStorage;
    if (storage.getItem('autoUpdate') == null) {
      storage.setItem('autoUpdate', "true")
      this.setState({autoUpdate: true})
    } else {
      this.setState({autoUpdate: JSON.parse(storage.getItem('autoUpdate').toLowerCase())})
    }

    document.addEventListener("keydown", (evt)=>{this.keyShortcuts(evt)}, false);
    var regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i; //uuidv4
    if (regex.test(window.location.pathname.substring(1))) {
      axios.post('/startsql', {id: window.location.pathname.substring(1)}, {}).then((res) => {
        this.setState({
          currentProjectId: window.location.pathname.substring(1),
          SQLprojects: false,
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
      this.runSQL(this.state.sql);
    }
  }

  runSQL(code) {
    var codearray = code.split(";")
    for (var h = 0; h < codearray.length; h++) {
      if (codearray[h] == "" || codearray[h] == " " || codearray[h] == "\n") {
        codearray.splice(h, 1)
      }
    }
    for (var h = 0; h < codearray.length; h++) {
      console.log(codearray)
      if (codearray[h] != undefined) {
        axios.post('/runsql', {code: codearray[h], id: this.state.currentProjectId}, {})
          .then((res) => {
            if (res.data.rows.length > 0) {
              var keys = Object.keys(res.data.rows[0]);
              var values = [];
              var valuesData = []
              var counter = 0;
              var arr = []
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
              this.setState({keys: keys, values: valuesData, valueAmount: Object.keys(res.data.rows[0]).length});
            } else {
              this.setState({sql: ''});
              axios.post('/startsql', {id: this.state.currentProjectId}, {}).then((res) => {
                this.setState({
                  tables: res.data.tables
                });
              })
              .catch((error) => {
                alert(error)
              })
              var ast = this.parser.astify(codearray[codearray.length-1]);
              if (this.state.autoUpdate && ast.table && ast.table[0] && ast.table[0].table) {
                this.runSQL("SELECT * FROM " + ast.table[0].table);
              }
            }
          })
          .catch((error) => {
            console.log(error)
            alert(error.response.data.error.message)
          })
      }
    }
  }

  loadSQL() {
    this.setState({SQLprojects: true});
  }

  startNew(template) {
    var newId = uuidv4();
    var name = prompt("Enter a name: ")

    if (name == "") {
      alert("Please enter a name")
    }

    if (name != "" && name != null) {
      var storage = window.localStorage;
      var type = '/startsql'
      if (template) {
        type = '/loadtemplate'
      }
      storage.setItem(name, newId );
      history.replaceState({}, name, "http://localhost:3000/" + newId)
      console.log("New database created with UUID: " + newId)
      axios.post(type, {id: newId, template: template}, {}).then((res) => {
        this.setState({currentProjectId: newId, creatingNew: false}, () => {
          axios.post('/startsql', {id: this.state.currentProjectId}, {}).then((res) => {
            this.setState({
              tables: res.data.tables
            });
          })
        });
      })
    }
  }
}
