ymaps.modules.define('Menu', [
  'MenuButton'
],
function(provide, MenuButton) {
  /**
   * Set of buttons at the left side of screen.
   */
  class Menu {
    /**
     * @param {AppMap} map
     * @param {Path} path
     */
    constructor(map, path, windList) {
      
      this.path = path;
      this.windList = windList;
      
      this.pressedButton = null;
 
      

      var settingsButton = 
        new MenuButton("Настройки", "images/icon_menu.svg", "#settingsMenu", this);







      // Clear Button
      var clearButton = new MenuButton("Очистить", "images/icon_eraser.svg");
      clearButton.events.add('click', function() {
        this.path.clear();          
      }.bind(this));

           
      // DzStartHeight Button
      var dzHeightButton = 
        new MenuButton("Настройки", "images/icon_settings.svg", "#dzHeightMenu", this);

      // Chute Button
      var chuteButton = 
        new MenuButton("Настройки парашюта", "images/icon_chute.svg", "#chuteMenu", this);

      // Help Button
      var helpButton = 
        new MenuButton("Справка", "images/icon_help.svg", "#helpMenu", this);

      // Wind Button
      this.windButton = 
        new MenuButton("Настройка ветра", "images/icon_arrow.svg", "#windMenu", this);

      // Add Wind Button
      
      var addWindButton = 
        new MenuButton("Добавить ветер", "images/icon_add_arrow.svg");
      addWindButton.events.add('click', function() {
        // We add new wind arrow (windsock)
        if (this.windList.lastWind.getHeight() != null) {   
          var point = findPlaceForNewArrow(this); 
          
          this.windList.addWind();
          this.windList.printCurrentWindWindow();
          this.windButton.showMenu();
          $("#menuArrow").removeClass("arrow");
          $("#menuArrow").addClass("arrow_selected");
        }

        function findPlaceForNewArrow(context) {
          
          return(context.windList.firstWind.arrow.geometry.getCoordinates());
        }  
        
      }.bind(this));     

      // Remove Wind Button
      
      var removeWindButton = 
        new MenuButton("Удалить ветер", "images/icon_remove_arrow.svg");
      removeWindButton.events.add('click', function() {
        if (this.windList.currentWind != this.windList.firstWind) {
          this.windList.removeWind(this.windList.currentWind);
          if (this.windList.numberOfWinds == 1) {
            $("#menuArrow").removeClass("arrow_selected");
            $("#menuArrow").addClass("arrow"); 
          }
        }
      }.bind(this));  

        
      // Adding Buttons to Map.
      map.controls.add(settingsButton, {position: {top: 45, left: 10}});  
      /*
      map.controls.add(dzHeightButton, {position: {top: 75, left: 10}});
      map.controls.add(chuteButton, {position: {top: 105, left: 10}});
      map.controls.add(this.windButton, {position: {top: 135, left: 10}});
      map.controls.add(addWindButton, {position: {top: 165, left: 10}});
      map.controls.add(removeWindButton, {position: {top: 195, left: 10}});      
      map.controls.add(helpButton, {position: {top: 225, left: 10}});   
      map.controls.add(clearButton, {position: {top: 255, left: 10}});  */         
    }  
  }
      
  provide(Menu);  
});   