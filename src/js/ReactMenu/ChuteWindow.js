import React from 'react';
import InputText from './InputText';

export default class ChuteWindow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.isShown) {
      return null;
    }

    return (
      <div style={{paddingTop: '35px'}}>
        <InputText inputLabel="Горизонтальная скорость парашюта (м/c)"
                   submittedValue={this.props.chute.horizontalVel}
                   handleSubmit={this.props.handleSubmit('horizontalVel')} />
        <InputText inputLabel="Вертикальная скорость парашюта (м/c)"
                   submittedValue={this.props.chute.verticalVel}
                   handleSubmit={this.props.handleSubmit('verticalVel')} />
      </div>
    );
  }
}