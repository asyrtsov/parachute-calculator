ymaps.modules.define('AppButton', [
    'control.Button',
    'templateLayoutFactory'        
],
function(provide, Button, templateLayoutFactory) {
 
 
  class AppButton extends Button {
    constructor(title='', 
                image='', 
                cssclass='inputControlElement',
                windowjQuerySelector,                 
                arrow=null, 
                pressedButton=null) {                                   
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

      this.windowjQuerySelector = windowjQuerySelector;
      this.arrow = arrow;
      this.pressedButton = pressedButton;

      //console.log("Ok");
      
      this.windowIsOn = false;  
      
      
      //this.clickButton = this.clickButton.bind(this);
      

            
      //console.log("Ok");
      /*
      // Cross closing of window element
      $(windowjQuerySelector + "Rectangle").click(function() {
        this.turnOffButton(this);  
        pressedButton = null;      
      });*/
      
      var self = this;
      
      this.events.add("click", clickButton.bind(self)); 
      //this.turnOffButton = this.turnOffButton.bind(this);
      
      console.log("Ok2");
      
      
      function clickButton() {
      
        //console.log("click");
        
        console.log(this);
        
        console.log(this.windowIsOn);

        this.windowIsOn = !this.windowIsOn;
        
        
        
        if (this.windowIsOn) {
          
          console.log("click");
          $(this.windowjQuerySelector).show();      
          //this.arrow.geometry.setCoordinates(map.getCenter());
          this.data.set('cssclass', 'pressedInputControlElement');

          //if ((pressedButton != null) && (pressedButton != this)) {
          //  turnOffButton(pressedButton);
         // }
         // pressedButton = currentButton;        
        } else {
          //$(this.windowjQuerySelector).hide();
          this.turnOffButton(this);
          //pressedButton = null;        
        } 

        function turnOffButton(turningOffButton) {
          $(turningOffButton.windowjQuerySelector).hide();
          turningOffButton.windowIsOn = false;
          turningOffButton.data.set('cssclass', 'inputControlElement');
        }  
        
  
      }
    
 
        
      
      
      
      
      
      
      
      
      
      
      
      
    
    }
    
    
  
       
  }  
  
  provide(AppButton);   
});
