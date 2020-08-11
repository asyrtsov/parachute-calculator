import React from 'react';

export default class DzWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.initialDz.name};

    var dz =[];
    for(let i=0; i < this.props.dzArray.length; i++) {
      dz.push((this.props.dzArray)[i].name);
    }

    this.optionItems = dz.map((name) =>
      <option key={name}>
        {name}
      </option>
    );

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.handleChange(event.target.value);
    this.setState({value: event.target.value});
  }


  render() {
    if (!this.props.isShown) {
      return null;
    }

    return (
      <div style={{paddingTop: '35px'}}>
        {/* form-control is Bootstrap CSS class */}
        <select className="form-control"
                value={this.state.value}
                onChange={this.handleChange}>
          {this.optionItems}
        </select>
      </div>
    );
  }
}