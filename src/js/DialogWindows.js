import React from 'react';
import ReactDOM from 'react-dom';
import Menu from './ReactMenu/Menu';


ymaps.modules.define('DialogWindows', ['Constant', 'Wind'],
function(provide, Constant, Wind) {

  var DialogWindows = {};
  /**
   * @param {AppMap} map
   * @param {Chute} chute
   * @param {WindList} windList
   * @param {Path} path
   * @param {Calculator} calculator
   */

  DialogWindows.initMenu = function(map, chute, windList, path, calculator) {

    // Close Settings Menu after clicking Cross or Dark screen
    $("#menuDarkScreenClickable").click(closeMenu);

    function closeMenu() {
      $("#menuDarkScreen").css("left", "-100%");
      if (window.matchMedia("(min-width: 768px)").matches) {
        $("#menu").css("left", "-50%");
      } else {
        $("#menu").css("left", "-100%");
      }
    }

    /**
     * @param {string} dzName
     */
    function handleDzChange(dzName) {
      for(let i=0; i<map.dz.length; i++) {
        if ((map.dz)[i].name == dzName) {
          map.currentDz = (map.dz)[i];
          var mapCenter = map.dz[i].mapCenter;
          map.setCenter(mapCenter, Constant.defaultZoom);
          map.arrow.setCoordinates(mapCenter);
          // path.clear() will print results too
          path.clear();
          clearVertexDirections();
          closeMenu();
          reactDomRender();
          return;
        }
      }
    }


    /**
     * @param {string} item - Two value: 'horizontalVel' or 'verticalVel'
     * (horizontal or vertical velocity).
     */
    function handleChuteSubmit(item) {
      return function(value) {
        if (value < 0) {
          alert('Скорость должна быть неотрицательной!');
        } else {
          if (item == 'horizontalVel') {
            chute.horizontalVel = value;
          } else if (item == 'verticalVel') {
            chute.verticalVel = value;
          }

          clearVertexDirections();
          if (path.length > 0) {
            calculator.calculateHeight();
          }

          if ((item == 'horizontalVel') &&
          (value > Constant.maxChuteHorizontalVelocity)
          || (item == 'verticalVel') &&
          (value > Constant.maxChuteVerticalVelocity)) {
            alert('Предупреждение: вы ввели большую скорость!');
          }
        }
        reactDomRender();
      }
    }

    /**
     * @param {number} value
     */
    function handleHeightSubmit(value) {
      if (value >= 0) {
        if (value > Constant.maxHeight) {
          alert('Предупреждение: вы ввели большую высоту!');
        }
        clearVertexDirections();
        path.setBaseVertexHeight(value);
      } else {
        alert('Высота в базовой точке должна быть неотрицательной!');
      }

      reactDomRender();
    }

    /**
     *
     * @param {object} heightValueAngle - [number, number, number].
     * @param {Wind} wind
     * @returns {boolean} - true iff wind was saved.
     */
    function handleWindSave(heightValueAngle, wind) {
      const [height, value, angle] = heightValueAngle;

      if (height >= Constant.maxHeight) {
        alert('Предупреждение: вы ввели большую высоту!');
      } else if (height < 0) {
        alert('Ошибка: высота должна быть не меньше 0!');
        return false;
      }

      if (value >= Constant.maxWindValue) {
        alert('Предупреждение: вы ввели большую скорость ветра!');
      } else if (value < 0) {
        alert('Ошибка: скорость должна быть не меньше 0!');
        return false;
      }

      const heightIsInList = windList.heightIsInList(height);
      if (wind != null) {  // wind is changed
        if (height != wind.height && heightIsInList) {
            alert('Такая высота уже была!');
            return false;
        }
      } else {  // new wind case
        if (heightIsInList) {
          alert('Такая высота уже была!');
          return false;
        }
      }

      if (wind != null) {
        wind.height = height;
        wind.value = value;
        wind.angle = angle;
      } else {
        const w = new Wind(value, angle, height, map);
        windList.addWind(w);
      }

      windList.sortList();

      if (wind == windList.firstWind) {
        map.windOutput.print(wind.toString());
        map.arrow.rotate(angle);
      }

      if (path.length > 0) {
        calculator.calculateHeight();
      }

      reactDomRender();
      return true;
    }


    function handleWindDelete(wind) {
      windList.removeWind(wind);
      if (path.length > 0) {
        calculator.calculateHeight();
      }
      reactDomRender();
    }


    /**
     * Clearing directions: skydiver will fly face forward.
     * We will clear direction after all changing in
     * Dialog windows.
     */
    function clearVertexDirections() {
      var wind = windList.firstWind;
      while(true) {
        wind.vertex.chuteImage.chuteDirection = true;
        wind.vertex.chuteImageBack.chuteDirection = true;
        wind = wind.nextWind;
        if (wind == null) break;
      }
      var vertex = path.firstVertex;
      while(true) {
        if (vertex == null) break;
        vertex.chuteImage.chuteDirection = true;
        vertex.chuteImageBack.chuteDirection = true;
        vertex = vertex.nextVertex;
      }
    }


    function reactDomRender() {
      ReactDOM.render(
        <Menu closeMenu={closeMenu}

              dzArray={map.dz}
              currentDz={map.currentDz}
              handleDzChange={handleDzChange}

              chute={chute}
              handleChuteSubmit={handleChuteSubmit}

              height={Math.floor(path.baseVertexHeight)}
              handleHeightSubmit={handleHeightSubmit}

              windList={windList}
              maxWindValue={Constant.maxWindValue}
              handleWindSave={handleWindSave}
              handleWindDelete={handleWindDelete} />,
        document.getElementById('menu')
      );
    }

    reactDomRender();

    return reactDomRender;
  }

  provide(DialogWindows);
});