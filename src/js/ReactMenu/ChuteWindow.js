import React from 'react';
import InputText from './InputText';

export default class ChuteWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      horizontalVel: props.initialHorizontalVel,
      verticalVel: props.initialVerticalVel
    };

    //this.handleHorizontalVelSubmit = this.handleHorizontalVelSubmit.bind(this);
    //this.handleVerticalVelSubmit = this.handleVerticalVelSubmit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /*
  handleHorizontalVelSubmit(value) {
    this.setState({horizontalVel: value});
    return this.props.handleHorizontalVelSubmit(value);
  }

  handleVerticalVelSubmit(value) {
    this.setState({verticalVel: value});
    return this.props.handleVerticalVelSubmit(value);
  }  */


  handleSubmit(velType) {
    return function(value) {
      this.setState({[velType]: value});
      return this.props.handleVelocitySubmit(velType, value);
    }.bind(this);
  }



  render() {
    if (!this.props.isShown) {
      return null;
    }

    return (
      <div style={{paddingTop: '35px'}}>
        <InputText inputLabel="Горизонтальная скорость парашюта (м/c)"
                   submittedValue={this.state.horizontalVel}
                   handleSubmit={this.handleSubmit('horizontalVel')} />
        <InputText inputLabel="Вертикальная скорость парашюта (м/c)"
                   submittedValue={this.state.verticalVel}
                   handleSubmit={this.handleSubmit('verticalVel')} />
      </div>
    );
  }
}