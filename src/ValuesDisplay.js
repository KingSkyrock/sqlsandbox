import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './styles.scss';

export default class ValuesDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  };

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr key={1}>
             {
               this.props.keys.map((key,i)=>
                  <th key={i}>{key}</th>
               )
             }
          </tr>
          </thead>
          <tbody>
            {
              this.props.values.map((values,i) =>(
                <tr className="value-row" key={i+1}>
                 {
                   values.map((value,j)=>
                      <td key={j}>{value}</td>
                   )
                 }
                </tr>
              ))
           }
          </tbody>
        </table>
      </div>
    );
  }

}

ValuesDisplay.propTypes = {
  values: PropTypes.array.isRequired,
  keys: PropTypes.array.isRequired,
  valueAmount: PropTypes.number.isRequired,
};
