ymaps.modules.define('MenuButton', [
  'control.Button'       
],
function(provide, Button) {
  /**
   * @extends control.Button
   */
  class MenuButton extends Button {
    /**
     * @param {string} [title] - Button hint.
     * @param {string} [image] - Src for <img> tag of this button.
     * @param {string} [windowjQuerySelector] - jQuery selector for corresponding window. 
     * @param {Menu} [menu] - Link to parent menu.   
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
 
      // When the button is clicked, corresponding window 
      // (with jquery selector this.windowjQuerySelector) will be shown.      
      if (this.windowjQuerySelector != '') {    
        this.events.add('click', function() {
          this.buttonIsOn = !this.buttonIsOn;
          if (this.buttonIsOn) {
            // show() is jQuery function
            $(this.windowjQuerySelector).show();      
            //arrow.geometry.setCoordinates(map.getCenter());
            this.data.set('cssclass', 'pressedInputControlElement');

            if ((this.menu.pressedButton != null) && (this.menu.pressedButton != this)) {
              this.menu.pressedButton.turnOffButton();
            }
            this.menu.pressedButton = this;        
          } else {
            this.turnOffButton();
            this.menu.pressedButton = null;        
          }   
        }.bind(this));
                
        // Cross closing of window element
        $(this.windowjQuerySelector + "Rectangle").click(function() {
          this.turnOffButton();  
          this.menu.pressedButton = null;      
        }.bind(this));
        
        this.turnOffButton = this.turnOffButton.bind(this);        
      }   
    }
    
    
    showMenu() {
      //this.buttonIsOn = !this.buttonIsOn;
      if (this.buttonIsOn == false) {
        this.buttonIsOn = true;          
        
        // show() is jQuery function
        $(this.windowjQuerySelector).show();      
        //arrow.geometry.setCoordinates(map.getCenter());
        this.data.set('cssclass', 'pressedInputControlElement');

        if ((this.menu.pressedButton != null) && (this.menu.pressedButton != this)) {
          this.menu.pressedButton.turnOffButton();
        }
        this.menu.pressedButton = this;        
      } else {
        //this.turnOffButton();
        //this.menu.pressedButton = null;        
      }       
    }
    
        
    /**
     * Turn off button.
     */     
    turnOffButton() {
      $(this.windowjQuerySelector).hide();
      this.buttonIsOn = false;
      this.data.set('cssclass', 'inputControlElement');
    }     
    
  } 
  provide(MenuButton);  
}); 
