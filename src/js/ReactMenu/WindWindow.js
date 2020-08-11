import React from 'react';
import WindWindowList from './WindWindowList';
import WindWindowInput from './WindWindowInput';


export default class WindWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        currentWind: props.windList.firstWind,
        isWindList: true
    };

    //this.switchPanel = this.switchPanel.bind(this);
    //this.addWind = this.addWind.bind(this);

    //this.selectWind = this.selectWind.bind(this);
    this.setCurrentWindHeight = this.setCurrentWindHeight.bind(this);
  }

  /*
  switchPanel(wind = null) {
    this.wind = wind;
    this.setState((state) => ({
      isWindList: !state.isWindList
    }));
  }  */

  /*
  addWind() {
    this.setState({
      wind: null,
      isWindList: false
    });
  } */

  /*
  selectWind = (wind) => {
    this.setState({
      currentWind: wind,
      isWindList: false
    });
  }  */


  setCurrentWindHeight(height) {
    this.props.handleWindHeightSubmit(this.state.currentWind, height);
  }



  render() {
    if (!this.props.isShown) {
      return null;
    }

    if (this.state.isWindList) {
      return (
        <WindWindowList
          windList={this.props.windList}
          selectWind={
              (wind) => {this.setState({currentWind: wind, isWindList: false})}}
          addWind={
              () => {this.setState({currentWind: null, isWindList: false})}} />
      );
    } else {
      return (
        <WindWindowInput
          wind={this.state.currentWind}
          maxWindValue={this.props.maxWindValue}
          handleWindHeightSubmit={this.setCurrentWindHeight}
          handleWindAngleChange={this.props.handleWindAngleChange}
          handleWindValueChange={this.props.handleWindValueChange}
          handleBackClick={() => {this.setState({isWindList: true})}} />
      );
    }
  }
}