import React from 'react';
import InputText from './InputText';

export default class HeightWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {initialHeight: props.initialHeight};

    this.handleHeightSubmit = this.handleHeightSubmit.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialHeight !== prevProps.initialHeight) {
      this.setState(function(state, props) {
        return {
          initialHeight: props.initialHeight
        };
      });
    }
  }

  handleHeightSubmit(value) {
    this.setState({initialHeight: value});
    return this.props.handleHeightSubmit(value);
  }

  render() {
    if (!this.props.isShown) {
      return null;
    }

    return(
      <div style={{paddingTop: '35px'}}>
        <InputText inputLabel="Высота в базовой точке (м)"
                  initialInputValue={this.state.initialHeight}
                  handleSubmit={this.handleHeightSubmit} />
      </div>
    );
  }
}