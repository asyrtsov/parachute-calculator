import React from 'react';
import WindWindowList from './WindWindowList';
import WindWindowInput from './WindWindowInput';


export default class WindWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedWind: null,
      isWindList: true,
      fromWindList: false
    };

    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleSelectClick = this.handleSelectClick.bind(this);

    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }


  handleAddClick() {
    this.setState({
      selectedWind: null,
      isWindList: false,
      fromWindList: true
    });
  }

  handleSelectClick(wind) {
    this.setState({
      selectedWind: wind,
      isWindList: false,
      fromWindList: true
    });
  }

  handleDeleteClick() {
    if (this.state.selectedWind != null) {
      this.props.handleWindDelete(this.state.selectedWind);
    }
    this.setState({isWindList: true});
  }

  /**
   * @param {object} heightValueAngle - [height, value, angle] array.
   */
  handleSaveClick(heightValueAngle) {
    return (
      this.props.handleWindSave(heightValueAngle, this.state.selectedWind));
    //this.setState({isWindList: true});
  }


  render() {
    return (
      <div>
        <WindWindowList
          windList={this.props.windList}
          handleSelectClick={this.handleSelectClick}
          handleAddClick={this.handleAddClick}
          isShown={this.props.isShown && this.state.isWindList} />

        <WindWindowInput
          selectedWind={this.state.selectedWind}
          selectedWindIsFirstWind={
            this.state.selectedWind == this.props.windList.firstWind}
          maxWindValue={this.props.maxWindValue}
          handleDeleteClick={this.handleDeleteClick}
          handleSaveClick={this.handleSaveClick}
          handleBackClick={() => {this.setState({isWindList: true})}}
          isShown={this.props.isShown && !this.state.isWindList}
          fromWindList={this.state.fromWindList}
          setFromWindList={(value) => {this.setState({fromWindList: value})}} />
      </div>
    );
  }
}