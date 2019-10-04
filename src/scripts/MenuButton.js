ymaps.modules.define('MenuButton', [
  'control.Button'       
],
function(provide, Button) {
  /**
   * MenuButton creates Yandex.Maps API button and
   * connects pressing on it with showing content of <div>, 
   * corresponding to this button. 
   * @extends control.Button
   */
  class MenuButton extends Button {
    /**
     * @param {string} [title] - Button hint.
     * @param {string} [image] - Src for <img> tag of this button.
     * @param {string} [windowjQuerySelector] - jQuery selector for corresponding window. 
     * @param {Menu} [menu] - Link to parent menu (if menu exists)
     * @param {string} [cssclass] - Css for this button.          
     */ 
    constructor(
      title='', 
      image='', 
      windowjQuerySelector='', 
      menu=null, 
      cssclass='inputControlElement' 
    ) {
      super({
        data: {
          title: title,
          image: image, 
          cssclass: cssclass        
        },  
        options: {
          layout: ymaps.templateLayoutFactory.createClass(
            "<div title='{{data.title}}' class='{{data.cssclass}}'>" + 
              "<img class='iconimage' src='{{data.image}}'>" +           
            "</div>"
          ),
          maxWidth: 300
        }
      });

      this.menu = menu;
      this.buttonIsOn = false;
      this.windowjQuerySelector = windowjQuerySelector;  
      
      if (this.windowjQuerySelector != '') {
                
        // When the button is clicked, corresponding window 
        // (with jquery selector this.windowjQuerySelector) will be shown. 
        this.events.add('click', function(e) {         
          $(this.windowjQuerySelector + "DarkScreen").css("left", "0");
          $(this.windowjQuerySelector).css("left", "0");      
        }.bind(this));

                
        // Cross closing of window element
        $(this.windowjQuerySelector + "Rectangle" + ", " + 
          this.windowjQuerySelector + "DarkScreenClickable").click(function(e) {
          
          $(this.windowjQuerySelector + "DarkScreen").css("left", "-100%");

          if (window.matchMedia("(min-width: 768px)").matches) {
            $(this.windowjQuerySelector).css("left", "-50%");  
          } else {
            $(this.windowjQuerySelector).css("left", "-100%");              
          }
        }.bind(this));     
      }   
    }        
  } 
  provide(MenuButton);  
}); 
