'use client'

import React from 'react';
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
        <button onClick={() => this.handleClick()}> {this.props.name} </button>
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
  id: PropTypes.string,
  select: PropTypes.func.isRequired
};
