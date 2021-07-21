import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './styles.scss';
import axios from 'axios';
import { faKey, faChevronUp, faColumns } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class SelectCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schema: null,
    }
  };

  render() {
    return (
      <div>
          <button className="tablecell" onClick={() => this.handleClick()}>
          {this.props.open &&
            <div>
              <strong><span className="tablename" >{this.props.name}</span></strong>
              <span className="chevron"> <FontAwesomeIcon size="xs" color="#f2f6ff" icon={faChevronUp} /> </span>
            </div>
          }
          {!this.props.open &&
            <div>
              <span className="tablename">{this.props.name}</span>
              <span className="chevron"> <FontAwesomeIcon rotation={180} size="xs" color="#f2f6ff" icon={faChevronUp}/> </span>
            </div>
          }

          </button>
            <div>
            {this.props.open &&
              <div className="schema">
                {this.state.schema}
              </div>
            }
            </div>
      </div>
    );
  }


  handleClick() {
    if (!this.props.open) {
      this.props.select(this.props.name);
      axios.post('/getSchema', {table: this.props.name, id: this.props.id}, {})
        .then((res) => {
          var arr = [];
          for (var i = 0; i < res.data.rows.length; i++) {
            arr.push(<div className="seperator"></div>)
            if (res.data.rows[i].pk == 1) {
              arr.push(<FontAwesomeIcon className="icon" color="#d1d5e3" icon={faKey} />)
              arr.push(<strong>{" " + res.data.rows[i].name + " "}</strong>)
              arr.push(<strong><span className="type-label">{res.data.rows[i].type.toLowerCase()}</span></strong>)
            } else {
              arr.push(<FontAwesomeIcon className="icon" color="#d1d5e3" icon={faColumns} />)
              arr.push(" " + res.data.rows[i].name + " ")
              arr.push(<span className="type-label">{res.data.rows[i].type.toLowerCase()}</span>)
            }
          }
          this.setState({schema: arr});
        })
        .catch((error) => {
          alert(error)
        })
    } else {
      this.setState({schema: null});
      this.props.select(null);
    }

  }

}

SelectCell.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  open: PropTypes.bool.isRequired,
  select: PropTypes.func.isRequired
};
