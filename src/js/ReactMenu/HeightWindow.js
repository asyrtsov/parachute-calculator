import React from 'react';
import InputText from './InputText';

export default class HeightWindow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.isShown) {
      return null;
    }

    return(
      <div style={{paddingTop: '35px'}}>
        <InputText inputLabel="Высота в базовой точке (м)"
                   submittedValue={this.props.height}
                   handleSubmit={this.props.handleSubmit} />
      </div>
    );
  }
}