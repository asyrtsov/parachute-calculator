ymaps.modules.define('Constant', [],
function(provide) {

  var Constant = {
    defaultStartHeight: 300, 
    defaultFinalHeight: 0, 
    defaultZoom: 16,
    // We will not consider cases when horizontal velocity 
    // is more than maxChuteHorizontalVelocity    
    maxChuteHorizontalVelocity: 25, 
    maxChuteVerticalVelocity: 15, 
    maxHeight: 4000, 
    maxWindValue: 10    
  }
      
  provide(Constant);  
}); 