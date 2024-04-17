'use client'

import React from 'react';
import PropTypes from 'prop-types';


export default class ToolbarButton extends React.Component {
  constructor(props) {
    super(props);

  };

  handleClick() {
    this.props.select(this.props.id);
  }

  render() {
    return (
      <>
        {this.props.currentlySelected == this.props.id ? 
          <button className="toolbar-button-selected">{this.props.name}</button>
        :
          <button className="toolbar-button" onClick={() => this.handleClick()}>{this.props.name}</button>
        }
      </>
    );
  }

}

ToolbarButton.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  currentlySelected: PropTypes.number.isRequired,
  select: PropTypes.func.isRequired,
};
