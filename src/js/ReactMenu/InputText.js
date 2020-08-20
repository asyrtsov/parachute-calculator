import React from 'react';

/**
 * Number input field.
 * Submission after focus loss.
 */
export default class InputText extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      ownUpdate: false
    };

    //console.log('InputText: constructor')

    this.ref = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }


  static getDerivedStateFromProps(props, state) {
    if (state.ownUpdate) {
      return {
        value: state.value,
        ownUpdate: false
      }
    } else {
      if (props.submittedValue != state.value) {
        return {
          value: props.submittedValue,
          ownUpdate: false
        };
      }
      return null;
    }
  }


  handleSubmit() {
    var numberValue = Number.parseFloat(this.state.value);
    if (!Number.isNaN(numberValue)) {
      this.props.handleSubmit(numberValue);
    } else {
      alert('Значение должно быть числом');
      this.setState({
        value: this.props.submittedValue,
        ownUpdate: true
      });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.ref.current.blur();
    }
  }

  handleChange(event) {
    this.setState({
      value: event.target.value,
      ownUpdate: true
    });
  }


  render() {
    return(
      <div style={{marginBottom: '16px'}}>
        <div style={{marginBottom: '8px'}}>
          {this.props.inputLabel}
        </div>
        <input type="text"
               className="form-control"
               ref={this.ref}
               value={this.state.value}
               onChange={this.handleChange}
               onBlur={this.handleSubmit}
               onKeyPress={this.handleKeyPress} />
      </div>
    );
  }
}