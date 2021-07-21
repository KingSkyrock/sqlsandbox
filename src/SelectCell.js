import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class SelectCell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bgColor: '#EFEFEF',
      selected: false,
    }
  };

  render() {
    return (
      <div>
        <button style={{backgroundColor: this.state.bgColor, border: "1px solid lightgray", width: "100px"}} onClick={() => this.handleClick()}> {this.props.name} </button>
        <br />
      </div>
    );
  }

  handleClick() {
    this.props.select(this.props.name, this.props.id);
  }

}

SelectCell.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.number,
  select: PropTypes.func.isRequired
};
