'use client';

import React from 'react';
import TableCell from '@/components/TableCell';
import ValuesDisplay from '@/components/ValuesDisplay';
import Header from '@/components/Header';
import axios from 'axios';
import { Parser } from 'node-sql-parser/build/mysql';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import 'overlayscrollbars/overlayscrollbars.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.parser = new Parser();
    this.editor = React.createRef();

    this.state = {
      currentProjectId: null,
      keys: [],
      values: [],
      valueAmount: 0,
      tables: [],
      openTable: null,
      sql: "SELECT * FROM",
    };
    
  }

  render() {
    return (
      <div className="main">
        <Header 
          projectId={this.state.currentProjectId}
          run={() => {this.runSQL(this.state.sql)}}
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
              <Panel defaultSize={80} minSize={20}>
                <OverlayScrollbarsComponent defer className="rows">
                  {this.state.keys &&
                    <ValuesDisplay keys={this.state.keys} values={this.state.values} valueAmount={this.state.valueAmount}  />
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
                      theme={tokyoNight}
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
    if (storage.getItem('autoUpdate') == null) {
      storage.setItem('autoUpdate', "true")
    }
    document.addEventListener("keydown", (evt)=>{this.keyShortcuts(evt)}, false);
    var regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i; //uuidv4
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
        axios.post('/api/runsql', {code: codearray[h], id: this.state.currentProjectId}, {})
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
              axios.post('/api/startsql', {id: this.state.currentProjectId}, {}).then((res) => {
                this.setState({
                  tables: res.data.tables
                });
              })
              .catch((error) => {
                alert(error)
              })
              var ast = this.parser.astify(codearray[codearray.length-1]);
              if (window.localStorage.getItem('autoUpdate') == 'true' && ast.table && ast.table[0] && ast.table[0].table) {
                this.runSQL("SELECT * FROM " + ast.table[0].table);
              }
            }
          })
          .catch((error) => {
            console.log(error)
            error.response && alert(error.response.data.error.message)
          })
      }
    }
  }
}

