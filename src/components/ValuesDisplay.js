'use client'

import React from 'react';
import PropTypes from 'prop-types';

export default class ValuesDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.counter = 0

    this.state = {
    }
  };

  render() {
    return (
      <>
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
                <>
                  {(i % 2 == 0) &&
                    <tr key={i+1}>
                     {
                       values.map((value,j)=>
                          <td className="value-row1" key={j}>{value}</td>
                       )
                     }
                    </tr>
                  }
                  {(i % 2 == 1) &&
                    <tr key={i+1}>
                     {
                       values.map((value,j)=>
                          <td className="value-row2" key={j}>{value}</td>
                       )
                     }
                    </tr>
                  }
                </>
              ))
           }
          </tbody>
        </table>
      </>
    );
  }

}

ValuesDisplay.propTypes = {
  values: PropTypes.array.isRequired,
  keys: PropTypes.array.isRequired,
  valueAmount: PropTypes.number.isRequired,
};
