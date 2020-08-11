import React from 'react';
import InputText from './InputText';
import InputRange from './InputRange';

export default class WindWindowInput extends React.Component {
  constructor(props) {
    super(props);

    var wind = this.props.wind;

    this.state = (wind == null) ?
        {height: '', angle: 0, value: 5} :
        {
          height: wind.height,
          angle: wind.angle,
          value: wind.value
        };

    this.windIsSet = (wind == null) ? false: true;

    this.handleHeightSubmit = this.handleHeightSubmit.bind(this);
    this.handleAngleChange = this.handleAngleChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
  }


  handleHeightSubmit(height) {
    console.log('handleHeightSubmit')
    var answer = (this.props.wind != null) ?
        this.props.handleHeightSubmit(this.props.wind, height) :
        this.props.handleHeightSubmit(null, height,
            this.state.angle, this.state.value);

    if (answer.isOk) {
      this.setState({height: height});
      this.windIsSet = true;
    }

  }

  handleAngleChange(angle) {
    console.log('handleAngleChange');
    this.setState({angle: angle});
    if (this.props.wind != null) {
      this.props.handleAngleChange(this.props.wind, angle);
    }
  }

  handleValueChange(value) {
    console.log('handleValueChange');
    this.setState({value: value});
    if (this.props.wind != null) {
      this.props.handleValueChange(this.props.wind, value);
    }
  }

  handleRemoveClick() {

  }


  render() {
    return (
      <div className="windWindowInput">

        <div className="windInputHeader">
          <div className="windInputHeaderArrowRectangle"
               onClick={this.props.handleBackClick}>
            <div className="windowArrow"
                 style={{marginLeft: 'auto', marginRight: 'auto'}}>
            </div>
          </div>
        </div>

        <InputText inputLabel="Высота, на которой дует ветер (м)"
                   initialInputValue={this.state.height}
                   hhandleSubmit={this.handleHeightSubmit} />
        <InputText inputLabel="Скорость ветра (м/c)"
                   value={this.state.value}
                   hhandleChange={this.handleValueChange} />
        <InputRange min="-180" max="180" step="5"
                    value={this.state.angle}
                    scale={['В', 'С', 'З', 'Ю', 'В']}
                    handleChange={this.handleAngleChange} />

        <div className="d-flex justify-content-center">
          {/* btn is Bootstrap CSS class */}
          <button className="btn appButton"
                  style={{marginTop: '30px'}}
                  onClick={this.handleRemoveClick}>
            Удалить
          </button>
        </div>

        <div className="d-flex justify-content-center">
          <button className="btn appButton"
                  style={{marginTop: '30px'}}
                  onClick={this.handleRemoveClick}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }
}