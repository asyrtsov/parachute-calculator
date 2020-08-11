import React from 'react';

/**
 * Number input field.
 * Submission after focus loss.
 */
export default class InputText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.submittedValue
    };
    // this.state.value isn't passed validaton,
    // we will restore previous value (prevValue)
    this.prevValue = this.state.value;

    this.ref = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleSubmit() {
    var numberValue = Number.parseFloat(this.state.value);
    if (!Number.isNaN(numberValue)) {
      if (numberValue != this.prevValue) {
        if (typeof(this.props.handleSubmit) != 'undefined') {
          var answer = this.props.handleSubmit(numberValue);
          if (answer.type != 'error') {
            this.setState({value: numberValue});
            this.prevValue = numberValue;
            if (answer.type == 'warning') {
              alert(answer.message);
            }
          } else {
            alert(answer.message);
            console.log(this.state.value);
            console.log(this.prevValue);
            this.setState({value: this.prevValue});

            //this.setState(function(state, props) {
            //  return {value: this.props.submittedValue};
            //});
          }
        } else {
          this.setState({value: numberValue});
          this.prevValue = numberValue;
        }
      }
    } else {
      alert('Величина должна быть числом!');
      this.setState({value: this.prevValue});
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.ref.current.blur();
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }


  componentDidUpdate(prevProps) {
    if (this.props.submittedValue !== prevProps.submittedValue) {

      console.log('InputText: componentDindUpdate: props changing')

      this.prevValue = this.props.submittedValue;

      this.setState(function(state, props) {
        return {value: this.props.submittedValue};
      });
    }
  }

  render() {
    return(
      <div className="form-group">
        <label>{this.props.inputLabel}</label>
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