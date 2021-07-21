import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

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
          <tbody>
            <tr key={1}>
             {
               this.props.keys.map((key,i)=>
                  <td key={i}>{key}</td>
               )
             }
            </tr>

            {
              this.props.values.map((values,i) =>(
                <tr key={i+1}>
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
