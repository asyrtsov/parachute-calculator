import React from 'react';

export default class HelpWindow extends React.Component {
  constructor(props) {
    super(props);

    this.helpItems = [
      'Предупреждение',
      'Назначение программы',
      'Траектория полета',
      'Направление',
      'Базовая вершина',
      'Ветер',
      'Аэродром',
      'Парашют'
    ];


    this.mainRef = React.createRef();

    this.helpRef = [];
    this.handleClick = [];

    for(var i=0; i<this.helpItems.length + 1; i++) {
      this.helpRef[i] = React.createRef();
    }

    for(var i=0; i<this.helpItems.length; i++) {
      this.handleClick[i]  = (function(i) {
        return function() {
          var scrollHeight = 0;
          for(var j=0; j<=i; j++) {
            scrollHeight += this.helpRef[j].current.scrollHeight + 3;
          }

          this.mainRef.current.scrollTop = scrollHeight;
        }.bind(this)
      }.bind(this))(i);
    }


    this.helpListItems = this.helpItems.map((item, index) =>
      <li key={index}><span onClick={this.handleClick[index]}>{item}</span></li>
    );

    this.setSomeHeights = this.setSomeHeights.bind(this);
  }


  componentDidMount() {
    this.setSomeHeights();
  }

  componentDidUpdate() {
    this.setSomeHeights();
  }

  setSomeHeights() {
    if (!this.props.isShown) {
      return;
    }
    var height = window.innerHeight - 150;
    this.mainRef.current.setAttribute('style', 'height: ' + height + 'px');
    this.helpRef[8].current.setAttribute('style', 'height: ' + height + 'px');
  }


  render() {
    if (!this.props.isShown) {
      return null;
    }

    return (
      <div ref={this.mainRef}
           className="helpWindow">
        <div ref={this.helpRef[0]}>
          <ul>{this.helpListItems}</ul>
        </div>

        <div ref={this.helpRef[1]}>
          <h1 style={{color: 'red', marginTop: '40px'}}>Предупреждение</h1>
          <p style={{color: 'red'}}>
          Данная программа может быть использована только
          для предварительного анализа. Перед полётами в незнакомом месте
          консультируйтесь с инструкторами.
          Программа находится в стадии тестирования.</p>
        </div>

        <div ref={this.helpRef[2]}>
            <h1>Назначение программы</h1>
            <p>Программа определяет изменение высоты парашюта
            вдоль заданной траектории полета.</p>
        </div>

        <div ref={this.helpRef[3]}>
          <h1>Траектория полета</h1>
          <p>Траектория полета парашюта задается в форме ломаной линии
          на Яндекс.Карте.</p>
          <p>Щелчок по карте добавляет новую вершину в конец траектории.
          Двойной щелчок добавляет новую вершину в начало траектории.</p>
          <p>Двойной щелчок по вершине траектории удаляет вершину.
          Одинарный щелчок на отрезке траектории добавляет вершину
          на этом отрезке.</p>
        </div>

        <div ref={this.helpRef[4]}>
          <h1>Направление</h1>
          <p>Вдоль заданного направленного отрезка при заданном ветре,
          парашют может лететь двумя способами:
          лицом по направлению отрезка, или - против направления
          (последний случай возможен, если ветер направлен в ту же
          сторону, что и отрезок, и скорость ветра выше скорости парашюта).</p>
          <p>Щелчок на иконку парашюта на отрезке переключает
          указанные способы полета.</p>
          <p>Если парашют не может лететь по прямой, содержащей
          отрезок (т.е. не может компенсировать компоненту скорости ветра,
          перпендикулярной отрезку), то иконка парашюта на данном отрезке
          не показывается.</p>
        </div>

        <div ref={this.helpRef[5]}>
          <h1>Базовая вершина</h1>
          <p>Расчет происходит так: вы задаете высоту в одной из
          вершин траектории (Базовой вершине) и программа расчитывает
          высоты в остальных вершинах.
          Базовая вершина выделена оранжевой границей.</p>
          <p>Выбор Базовой вершины осуществляется щелчком мыши
          на требуемую вершину.
          Высота в Базовой вершине задается в меню "Высота".</p>
        </div>

        <div ref={this.helpRef[6]}>
          <h1>Ветер</h1>
          <p>Величину и и направление ветера можно задавать
          на нескольких высотах. По умолчанию ветер
          на всех высотах одинаков и совпадает с поверхностным ветром.
          Высота ветра - минимальная высота, на которой дует
          соответствующий ветер.</p>
          <p>Добавить или удалить ветер на определенной высоте, а также
          изменить параметры ветра можно в меню "Ветер".
          Щелчок на строку, соответствующую ветру, открывает окно
          редактирования параметров ветра.
          Точка на траектории, в которой парашют достигает высоты ветра,
          имеет зеленый цвет.</p>
        </div>

        <div ref={this.helpRef[7]}>
          <h1>Аэродром</h1>
          <p>Аэродром можно выбрать двумя способами:
          в меню "Аэродром",
          или в строке поиска Яндекс.Карт</p>
        </div>

        <div ref={this.helpRef[8]}>
          <h1>Парашют</h1>
          <p>В меню "Парашют"
          можно установить вертикальную и горизонтальную скорость парашюта.</p>
        </div>
      </div>
    );
  }
}