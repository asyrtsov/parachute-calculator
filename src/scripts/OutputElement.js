ymaps.modules.define('OutputElement', [
  'control.Button', 
  'templateLayoutFactory'  
],
function(provide, Button, templateLayoutFactory) {
  
  class OutputElement extends Button {
    /**
     * @param {string} content   
     */
    constructor(content='') {
      
      super({
        data: {content: content},  
          
        options: {
          layout: templateLayoutFactory.createClass(
            "<div class='outputControlElement'>{{data.content}}</div>"
          ),
         maxWidth: 300 
        }
      });           
    }
  } 
  provide(OutputElement);  
}); 