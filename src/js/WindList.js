ymaps.modules.define('WindList', ['Wind'],
function(provide, Wind) {

  /**
   * List of winds at different heights;
   * always contains wind at height = 0m (surface wind);
   * that surface wind is always first and cannot be removed.
   * All winds must have number height.
   * List will be sorted for height (from bottom to top);
   * all winds should have different heights.
   */
  class WindList {
    constructor(map) {
      this.map = map;

      // Surface wind: 5 m/sec, West
      var angle = 0;
      this.firstWind = new Wind(5, angle, 0, map);
      this.firstWind.vertex.addToMap();
      map.windOutput.print(this.firstWind.toString());
      map.arrow.rotate(angle);

      this.lastWind = this.firstWind;
      this.numberOfWinds = 1;

      this.calculator = null;
    }

    setCalculator(calculator) {
      this.calculator = calculator;
      var wind = this.firstWind;
      while(wind != null) {
        //wind.vertex.chuteImage.setCalculator(calculator);
        wind.vertex.setCalculator(calculator);
        wind = wind.nextWind;
      }
    }


    /**
     * Add wind to the List and sort List.
     * Note: wind.height must be a number.
     * @param {Wind} wind
     */
    addWind(wind) {
      wind.vertex.addToMap();
      this.lastWind.setNextWind(wind);
      this.lastWind = wind;
      this.numberOfWinds++;
      //wind.vertex.chuteImage.setCalculator(this.calculator);
      wind.vertex.setCalculator(this.calculator);
      this.sortList();
    }


    /**
     * Remove wind from WindList.
     * Note: you cannot remove firstWind by construction.
     * @param {Wind} wind - It is supposed that wind belongs to WindList.
     */
    removeWind(wind) {
      // First wind, that is, surface wind, cannot be removed
      if (wind == this.firstWind) {
        console.warn("This wind was not removed, because it was firstWind.");
        return;
      }

      if (wind.vertex.vertexIsOnMap) {
        wind.vertex.removeFromMap();
      }

      wind.prevWind.setNextWind(wind.nextWind);
      if (wind == this.lastWind) {
        this.lastWind = this.lastWind.prevWind;
      }
      this.numberOfWinds--;
    }


    /**
     * Check if this list has a wind with given height.
     * @param {number} height
     */
    heightIsInList(height) {
      var wind = this.firstWind;
      while(wind != null) {
        if (wind.getHeight() == height) return true;
        wind = wind.nextWind;
      }
      return false;
    }


    /**
     * Bubble sort (it is practical for small list)
     */
    sortList() {
      while(true) {
        var wind = this.firstWind;
        var swapped = false;

        while(wind != this.lastWind) {
          if (wind.height > wind.nextWind.height) {
            this.swapWindAndNextWind(wind);
            swapped = true;
          } else {
            wind = wind.nextWind;
          }
        }
        if (!swapped) break;
      }
    }


    /**
     * Print List in console (for development needs)
     */
    printList() {
      console.log('\n\n\n');
      var wind = this.firstWind;
      var i=0;
      while(wind != null) {
        console.log('wind #' + i + ':');
        console.log(wind);
        i++;
        wind = wind.nextWind;
      }
    }


    /**
     * Swap wind and wind.nextWind.
     */
    swapWindAndNextWind(wind) {
      var nextWind = wind.nextWind;
      if (nextWind == null) return;

      nextWind.setPrevWind(wind.prevWind);
      var nextWindNextWind = nextWind.nextWind;
      nextWind.setNextWind(wind);
      wind.setNextWind(nextWindNextWind);

      if (this.firstWind == wind) {
        this.firstWind = nextWind;
      }
      if (this.lastWind == nextWind) {
        this.lastWind = wind;
      }
    }


    hide() {
      var wind = this.firstWind;
      while(wind != null) {
        wind.vertex.hide();
        wind = wind.nextWind;
      }
    }



    /**
     * Clearing directions: skydiver will fly face forward.
     */
    clearDirections() {
      var wind = this.firstWind;
      while(true) {
        wind.vertex.chuteImage.chuteDirection = true;
        wind.vertex.chuteImageBack.chuteDirection = true;
        wind = wind.nextWind;
        if (wind == null) break;
      }
    }
  }

  provide(WindList);
});