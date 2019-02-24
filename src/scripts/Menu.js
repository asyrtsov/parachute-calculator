ymaps.modules.define('Menu', [
  'MenuButton'
],
function(provide, MenuButton) {
  /**
   * Set of buttons at the left side of screen.
   */
  class Menu {
    /**
     * @param {Map} map
     * @param {Path} path
     */
    constructor(map, path) {
      
      this.path = path;      
      this.pressedButton = null;
         
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

      // Adding Buttons to Map.  
      map.controls.add(dzHeightButton, {position: {top: 45, left: 10}});
      map.controls.add(chuteButton, {position: {top: 75, left: 10}});
      map.controls.add(this.windButton, {position: {top: 105, left: 10}});
      map.controls.add(helpButton, {position: {top: 135, left: 10}});   
      map.controls.add(clearButton, {position: {top: 165, left: 10}});     
    }  
  }
      
  provide(Menu);  
});   