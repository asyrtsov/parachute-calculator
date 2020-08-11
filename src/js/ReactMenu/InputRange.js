import React from 'react';

export default class InputRange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.value};

    this.handleChange = this.handleChange.bind(this);

    var scale = this.props.scale;

    console.log('InputRange: constructor');


    /*
    var scaleElem = scale.map((item) =>

    );  */

  }

  handleChange(event) {
    console.log(event.target.value);
    this.props.handleChange(event.target.value);
    this.setState({value: event.target.value});
  }

  render() {
    return(
      <div>
        <input type="range" min={this.props.min} max={this.props.max}
               step={this.props.step} value={this.state.value}
               onChange={this.handleChange} />
        <div className="sliderScale"></div>
      </div>
    );
  }
}