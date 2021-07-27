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

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    paddingTop: '20px',
    paddingLeft: '50px',
    border: '0px',
    height: '80%',
    width: '65%',
    minWidth: '350px',
    backgroundColor: '35415E'
  },
  overlay: {
     background: 'rgba(90, 111, 161, 0.3)'
   }
};

const customStyles2 = {
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
    backgroundColor: '35415E'
  },
  overlay: {
     background: 'rgba(90, 111, 161, 0.3)'
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
            style={customStyles2}
            contentLabel="New project modal"
          >
            <div className="select-modal-buttons">
              <div className="template-select">
                <h2 className="template-select-header">Templates</h2>
                <button onClick={() => this.startNew(1)}>Northwind</button>
                <button onClick={() => this.startNew(2)}>Hostpital</button>
              </div>
              <div></div>
              <button className="new-empty" onClick={() => this.startNew(false)}>New empty database</button>
            </div>
          </Modal>
          <button className="load-sql" onClick={() => this.loadSQL()}>Load SQL</button>
          <div onClick={() => this.setState({settingsOpen: true})} className="settings">
            <FontAwesomeIcon size="2x" className="icon" color="#d1d5e3" icon={faCog} />
            <Modal
              isOpen={this.state.settingsOpen}
              onRequestClose={this.closeModals}
              style={customStyles}
              contentLabel="Settings Modal"
            >
              <h1 className="settings-header">Settings</h1>
              <label className="settings-label" htmlFor="autoUpdate">Auto select after modification</label>
              <input onChange={() => {
                this.setState({autoUpdate: !this.state.autoUpdate})
              }} type="checkbox" id="autoUpdate" checked={this.state.autoUpdate} />
            </Modal>
          </div>
        </div>
        <div className="content-container">
          <div className="content-area">
            <div className="rows">
              {!this.state.currentProjectId &&
                <div>
                  <div className="title">Welcome</div>
                  <div className="subtitle">Create a new database or load an existing one</div>
                </div>
              }
              {this.state.keys &&
                <ValuesDisplay keys={this.state.keys} values={this.state.values} valueAmount={this.state.valueAmount}  />
              }
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
                  style={customStyles2}
                  contentLabel="Projects Modal"
                >
                <div className="select-modal-buttons">
                  <div className="template-select">
                    <h2 className="template-select-header">Projects</h2>
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
                  </div>
                  <div></div>
                  <button className="new-empty">Load .sqlite file</button>
                </div>
                </Modal>
              }
            </div>
          </div>
          <div className="tables-container">
            <div className="tables">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  runSQL(code) {
    axios.post('/runsql', {code: code, id: this.state.currentProjectId}, {})
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
          var ast = this.parser.astify(code);
          if (this.state.autoUpdate && ast.table && ast.table[0] && ast.table[0].table) {
            this.runSQL("SELECT * FROM " + ast.table[0].table);
          }
        }
      })
      .catch((error) => {
        alert(error.response.data.error.message)
      })
  }

  loadSQL() {
    this.setState({keys: [], values: [], valueAmount: 0, currentProjectId: false, SQLprojects: true});
  }

  startNew(template) {
    var newId = uuidv4();
    var name = prompt("Enter a name: ")

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
