import React from 'react';

export default class WindWindowList extends React.Component {
  constructor(props) {
    super(props);

    this.handleTableClick = this.handleTableClick.bind(this);
  }


  // Change selected wind
  handleTableClick(wind) {
    return function() {
      this.props.handleSelectClick(wind);
    }.bind(this);
  }


  render() {

    if (!this.props.isShown) {
      return null;
    }


    var windList = this.props.windList;
    var wind = windList.firstWind;

    var tableElements = [];

    for(var i=0; i < windList.numberOfWinds; i++) {
      tableElements[i] =
          <tr key={i.toString()}
              onClick={this.handleTableClick(wind)}>
            <td>
              {wind.height + ' м'}
            </td>
            <td>
              <div className="arrow"
                  style={{transform: 'rotate(' + (-1)*wind.getAngle() + 'deg)'}}>
              </div>
            </td>
            <td>
              {wind.value + ' м/с'}
            </td>
          </tr>;
      wind = wind.nextWind;
    }

    return (
      <div className="windWindowList">
        {/* table is Bootstrap CSS class */}
        <table className="table">
          <tbody>
            {tableElements}
          </tbody>
        </table>
        {/* btn is Bootstrap CSS class */}
        <button className="btn appButton"
                style={{marginTop: '20px'}}
                onClick={this.props.handleAddClick}>
          Добавить ветер
        </button>
      </div>
    );
  }
}