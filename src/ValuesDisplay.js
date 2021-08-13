import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './styles.scss';

export default class ValuesDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.counter = 0

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
            <div className="ghost">{this.counter = 0}</div>
            {
              this.props.values.map((values,i) =>(
                <>
                  {(this.counter % 2 == 0) &&
                    <tr key={i+1}>
                     {
                       values.map((value,j)=>
                          <td className="value-row1" key={j}>{value}</td>
                       )
                     }
                    </tr>
                  }
                  {(this.counter % 2 == 1) &&
                    <tr key={i+1}>
                     {
                       values.map((value,j)=>
                          <td className="value-row2" key={j}>{value}</td>
                       )
                     }
                    </tr>
                  }
                  <div className="ghost">{this.counter++}</div>
                </>
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
