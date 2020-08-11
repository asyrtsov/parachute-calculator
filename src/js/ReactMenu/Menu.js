import React from 'react';
import DzWindow from './DzWindow';
import ChuteWindow from './ChuteWindow';
import HeightWindow from './HeightWindow';
import HelpWindow from './HelpWindow';
import WindWindow from './WindWindow';


export default class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {activeKey: 'dz'};

    this.menuArray = [
      ['Аэродром', 'dz'],
      ['Парашют', 'chute'],
      ['Высота', 'height'],
      ['Ветер', 'wind'],
      ['Справка', 'help']
    ];

    this.handleClick = this.handleClick.bind(this);
  }


  handleClick(index) {
    return function() {
      if (this.state.activeKey != index) {
        this.setState({activeKey: index});
      }
    }.bind(this);
  }


  render() {
    var navLink = this.menuArray.map((item) =>
      <a key={item[1]}
         className={item[1] == this.state.activeKey ?
                                 "nav-link menuNavLinkActive" :
                                 "nav-link menuNavLink"}
         href="#"
         onClick={this.handleClick(item[1])}>
        {item[0]}
      </a>
    );

    return (
      <div>
        <div className="menuHeader">
          <div className="menuHeaderRectangle"
               onClick={this.props.closeMenu}>
            <div className="windowArrow"></div>
          </div>
        </div>

        <nav className="nav menuNav">
          {navLink}
        </nav>

        <div className="container">
          <DzWindow
              dzArray={this.props.dzArray}
              initialDz={this.props.currentDz}
              handleChange={this.props.handleDzChange}
              isShown={this.state.activeKey == "dz"} />

          <ChuteWindow
              initialHorizontalVel={this.props.horizontalVel}
              initialVerticalVel={this.props.verticalVel}
              handleVelocitySubmit={this.props.handleVelocitySubmit}

              handleHorizontalVelSubmit={this.props.handleHorizontalVelSubmit}
              handleVerticalVelSubmit={this.props.handleVerticalVelSubmit}
              isShown={this.state.activeKey == "chute"} />

          <HeightWindow
              initialHeight={this.props.height}
              handleHeightSubmit={this.props.handleHeightSubmit}
              isShown={this.state.activeKey == "height"} />

          <WindWindow
              windList={this.props.windList}
              maxWindValue={this.props.maxWindValue}
              handleWindHeightSubmit={this.props.handleWindHeightSubmit}
              handleWindAngleChange={this.props.handleWindAngleChange}
              handleWindValueChange={this.props.handleWindValueChange}
              isShown={this.state.activeKey == "wind"} />

          <HelpWindow
              isShown={this.state.activeKey == "help"} />

        </div>
      </div>
    );
  }
}