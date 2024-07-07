'use client'

import React from 'react';
import PropTypes from 'prop-types';
import SelectCell from '@/components/SelectCell';
import HeaderLogo from '@/components/HeaderLogo';
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-modal';
import axios from 'axios';
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import 'overlayscrollbars/overlayscrollbars.css';
import { useRouter } from "next/navigation";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

export default function HeaderWrapper (props) {
  const router = useRouter();
  return <Header {...props} router={router} />
}

Modal.setAppElement('#root');
class Header extends React.Component {
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();
    this.fileA = React.createRef();

    this.state = {
      creatingNewModal: false,
      signinModal: false,
      loadSQLModal: false,
      settingsOpen: false,
      autoClear: false,
      exportedFile: null,
      loggedIn: false,
    }
    this.closeModals = this.closeModals.bind(this);
  };

  closeModals(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState({settingsOpen: false, creatingNewModal: false, signinModal: false, loadSQLModal: false});
  }

  startNew(template) {
    var newId = uuidv4();
    var name = prompt("Enter a name: ")

    if (name == "") {
      alert("Please enter a name")
    }

    if (name != "" && name != null) {
      name = "data-" + name
      var storage = window.localStorage;
      var type = '/api/startsql'
      if (template) {
        type = '/api/loadtemplate'
        if (template == 4) {
          newId += "-l"
          template = 1
        }
      }
      storage.setItem(name, newId);
      history.replaceState({}, name, "/" + newId)
      axios.post(type, {id: newId, template: template}, {}).then((res) => {
        axios.post('/api/startsql', {id: newId}, {}).then((res) => {
          this.props.router.push("/" + newId);
        })
      })
    }
  }

  uploadFile() {
    var newId = uuidv4();
    var formData = new FormData();
    var blob = this.fileInput.current.files[0].slice(0, this.fileInput.current.files[0].size, '.sqlite');
    var newFile = new File([blob], newId + '.sqlite', { type: '.sqlite' });
    formData.append("file", newFile);

    var name = prompt("Enter a name: ", this.fileInput.current.value.split(/(\\|\/)/g).pop())

    if (name == "") {
      alert("Please enter a name")
    }

    if (name != "" && name != null) {
      name = "data-" + name
      var storage = window.localStorage;

      storage.setItem(name, newId);
      console.log("New database created with UUID: " + newId)
      axios.post('/api/uploadfile', formData, {}, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        axios.post('/api/startsql', { id: newId }, {}).then((res) => {
          this.props.router.push("/" + newId);
        })
      })
    }
  }

  componentDidMount() {
    var storage = window.localStorage;
    if (storage.getItem('autoClear') == null) {
      storage.setItem('autoClear', "false")
    } else {
      this.setState({autoClear: JSON.parse(storage.getItem('autoClear').toLowerCase())});
    }
    axios.post('/api/check_logged_in', {withCredentials: true }).then((res) => {
      this.setState({loggedIn: true});
      this.props.updateLoggedIn(res.data.loggedIn)
    })
    .catch((error) => {
      alert(error)
    })
  }

  handleOauth(credentialResponse) {
    axios.post('/api/google_oauth', credentialResponse, {}).then((res) => {
      this.setState({signinModal: false, loggedIn: true});
      this.props.updateLoggedIn(true)
    })
    .catch((error) => {
      alert(error)
    })
  }

  render() {
    return (
      <div className="header">
        <div onClick={() => {this.props.router.push("/")}} className="header-logo-container">
          <HeaderLogo />
        </div>
        <div className="header-wall"></div>
        {this.props.projectId ?
          <button className="secondary-button" onClick={() => {this.setState({creatingNewModal: true})}}>New</button>
          :
          <button className="primary-button" onClick={() => {this.setState({creatingNewModal: true})}}>New</button>
        }
        <Modal
          isOpen={this.state.creatingNewModal}
          onRequestClose={this.closeModals}
          className="modal new-sql-modal"
          overlayClassName="modal-overlay"
          contentLabel="New project modal"
        >
          <div className="modal-title">New Database Creation</div>
          <div className="modal-subtitle">Create an empty database, load a.sqlite file, or use a template</div>
          <div className="modal-subtitle">Use the learning template if you want to start learning SQL!</div>
          <br />
          <button className="new-empty" onClick={() => this.startNew(false)}>New empty database</button>
          <button className="new-template" onClick={() => this.fileInput.current.click()}>Upload file</button>
          <input  onChange={() => this.uploadFile()} className="file-input" ref={this.fileInput} name="sqlupload" accept=".sqlite" type="file" />
          {this.state.loggedIn ?
            <button className="new-template" onClick={() => this.startNew(4)}>Learning Template</button>
          :
            <>
              <button data-tooltip-id="learning-button" data-tooltip-place="right" className="new-template disabled">Learning Template</button>
              <Tooltip id="learning-button" className="tooltip" clickable>
                <a onClick={() => this.setState({signinModal: true})} >Sign in</a> to start learning
              </Tooltip>
            </>
          }
          <button className="new-template" onClick={() => this.startNew(1)}>Northwind Template</button>
          <button className="new-template" onClick={() => this.startNew(2)}>Hospital Template</button>
          <button className="new-template2" onClick={() => this.startNew(3)}>Planet Express Template</button>
        </Modal>
        <button className="secondary-button" onClick={() => {this.setState({loadSQLModal: true})}}>Load</button>
        {this.state.loadSQLModal &&
          <Modal
          isOpen={this.state.loadSQLModal}
          onRequestClose={this.closeModals}
          className="modal"
          overlayClassName="modal-overlay"
          contentLabel="Projects Modal"
        >
          <div className="modal-title">Load a Database</div>
          <div className="modal-subtitle">Select an existing project to load.</div>
          <OverlayScrollbarsComponent defer className="projects-list">
              {Object.entries(window.localStorage).map((project) => {
                if (project[0].startsWith("data-")) {
                  return (
                    <SelectCell key={project[1]} id={project[1]} name={project[0].slice(5)} select={(name, id) => {
                      axios.post('/api/startsql', {id: id}, {}).then((res) => {
                        this.props.router.push("/" + id);
                      })
                      .catch((error) => {
                        alert(error)
                      })
                      
                    }}/>
                  )
                }
              })}
          </OverlayScrollbarsComponent>
        </Modal>
        }
        {this.props.projectId &&
          <>
            <button className="secondary-button" onClick={() => this.fileA.current.click()}>Export</button>
            <a style={{ display: 'none' }} ref={this.fileA} href={'data/' + this.props.projectId + '.sqlite'} download="database.sqlite"></a>
          </>
        }
        {this.props.loggedIn ?
        <button
          onClick = {
            () => this.setState({loggedIn: false}, 
              () => this.props.updateLoggedIn(false, 
                () => googleLogout()
            ))
          } 
          className="secondary-button signin-button">
          Log out
        </button>
        :
        <button onClick={() => this.setState({signinModal: true})} className="secondary-button signin-button">Sign in</button>
        }
        
        <Modal
          isOpen={this.state.signinModal}
          onRequestClose={this.closeModals}
          className="modal sign-in-modal"
          overlayClassName="modal-overlay"
          contentLabel="Sign In Modal"
        >
          <div className="modal-title">Sign in</div>
          <div className="google-login-button">
            <GoogleLogin
            onSuccess={credentialResponse => this.handleOauth(credentialResponse)}
            onError={() => {
              alert('Login Failed');
            }}
            text="continue_with"
            theme={this.props.theme ? "filled_black" : "outline"}
          />
          </div>
          
        </Modal>
        <div onClick={() => this.setState({settingsOpen: true})} className="settings">
          <FontAwesomeIcon size="2x" className="icon" color="#d1d5e3" icon={faCog} />
          <Modal
            isOpen={this.state.settingsOpen}
            onRequestClose={this.closeModals}
            className="modal"
            overlayClassName="modal-overlay"
            contentLabel="Settings Modal"
          >
            <h1 className="settings-header">Settings</h1>
            <label className="settings-label" htmlFor="darkTheme">Use dark theme</label>
            <input onChange={() => {
              this.props.updateTheme(!this.props.theme, () => {
                var storage = window.localStorage;
                var html = document.querySelector('html');
                if (this.props.theme == true) {
                  storage.setItem('darkTheme', "true")
                  html.setAttribute('theme', "dark");
                } else {
                  storage.setItem('darkTheme', "false")
                  html.setAttribute('theme', "light");
                }
              });
            }} type="checkbox" id="autoClear" checked={this.props.theme} />
            <br/><br/>
            <label className="settings-label" htmlFor="autoClear">Clear input after successful execution</label>
            <input onChange={() => {
              this.setState({autoClear: !this.state.autoClear}, () => {
                var storage = window.localStorage;
                if (this.state.autoClear == true) {
                  storage.setItem('autoClear', "true")
                } else {
                  storage.setItem('autoClear', "false")
                }
              });
            }} type="checkbox" id="autoClear" checked={this.state.autoClear} />
          </Modal>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  projectId: PropTypes.string,
  updateTheme: PropTypes.func,
  updateLoggedIn: PropTypes.func,
  theme: PropTypes.bool,
};
