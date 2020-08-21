import React from 'react';

export default class WindWindowInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      height: '',
      value: '',
      angle: '',
      ownUpdate: false,
      saveButtonIsAvialable: false,
      deleteButtonIsShown: false
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }


  static getDerivedStateFromProps(props, state) {
    //console.log('WindWindowInput: getDerivedStateFromProps');
    if (state.ownUpdate) {
      return {...state, ownUpdate: false};
    } else {
      if (props.fromWindList) {
        const wind = (props.selectedWind == null) ?
            {height: '', value: '', angle: ''} :
            props.selectedWind.getParamsString();

        return {
          ...wind,
          ownUpdate: false,
          saveButtonIsAvialable: false,
          deleteButtonIsShown: !props.selectedWindIsFirstWind};
      } else {
        return null;
      }
    }
  }


  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      ownUpdate: true,
      saveButtonIsAvialable: true
    });
  }


  handleSaveClick() {
    const height = Number.parseFloat(this.state.height);
    const value = Number.parseFloat(this.state.value);
    const angle = Number.parseFloat(this.state.angle);
    const heightIsNaN = Number.isNaN(height);
    const valueIsNaN = Number.isNaN(value);
    if (heightIsNaN || valueIsNaN) {
      if (heightIsNaN && valueIsNaN) {
        alert('Значение высоты должно быть числом! \n' +
              'Значение скорости должно быть числом!');
      } else if (heightIsNaN) {
        alert('Значение высоты должно быть числом!');
      } else if (valueIsNaN) {
        alert('Значение скорости должно быть числом!');
      }
      return;
    }

    var isOk = this.props.handleSaveClick([height, value, angle]);
    if (isOk) {
      this.setState({saveButtonIsAvialable: false});
    }
  }

  componentDidUpdate() {
    if (this.props.fromWindList) {
      this.props.setFromWindList(false);
    }
  }


  render() {
    if (!this.props.isShown) {
      return null;
    }

    var deleteButtonIsAvialable =
      (this.props.selectedWind != null) ||
      (this.props.selectedWind == null &&
       this.state.height != '' &&
       this.state.value != '' &&
       !this.state.saveButtonIsAvialable);

    return (
      <div className="windWindowInput">

        <div className="windInputHeader">
          <div
            className="windInputHeaderArrowRectangle"
            onClick={this.props.handleBackClick}>
            <div
              className="windowArrow"
              style={{marginLeft: 'auto', marginRight: 'auto'}}>
            </div>
          </div>
        </div>

        <div style={{marginBottom: '8px'}}>Высота, на которой дует ветер (м)</div>
        <input
          type="text"
          name="height"
          className="form-control"
          autoComplete="off"
          value={this.state.height}
          disabled={!this.state.deleteButtonIsShown}
          onChange={this.handleInputChange} />

        <div style={{marginBottom: '8px'}}>Скорость ветра (м/c)</div>
        <input
          type="text"
          name="value"
          className="form-control"
          autoComplete="off"
          value={this.state.value}
          onChange={this.handleInputChange} />

        <div
            className="d-flex justify-content-between"
            style={{marginTop: '40px' , marginBottom: '8px'}}>
          <div>Направление ветра</div>
          <div
            className="arrow"
            style={{transform: 'rotate(' + (-1)*Number(this.state.angle) + 'deg)'}}>
          </div>
        </div>
        <input
          type="range"
          name="angle"
          className="input-range"
          min="-180"
          max="180"
          step="5"
          value={this.state.angle}
          onChange={this.handleInputChange} />

        <div className="d-flex justify-content-center">
          <button
            className={this.state.saveButtonIsAvialable ?
              "btn appButton appButton_hover" :
              "btn appButton" }
            disabled={!this.state.saveButtonIsAvialable}
            style={{marginTop: '30px'}}
            onClick={this.handleSaveClick}>
            Сохранить
          </button>
        </div>

        <div className="d-flex justify-content-center">
          {/* btn is Bootstrap CSS class */}
          <button
            className={deleteButtonIsAvialable ?
              "btn appButton appButton_hover" :
              "btn appButton" }
            disabled={!deleteButtonIsAvialable}
            style={{
              marginTop: '30px',
              display: this.state.deleteButtonIsShown ? 'block' : 'none'
            }}
            onClick={() => {this.props.handleDeleteClick();}}>
            Удалить
          </button>
        </div>
      </div>
    );
  }
}