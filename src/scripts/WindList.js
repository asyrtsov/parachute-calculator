ymaps.modules.define('WindList', [
  'Wind', 
  'WindOutputElement'
],
function(provide, Wind, WindOutputElement) {

  /**
   * List of winds at different heights; 
   * always contains wind at height = 0m (surface wind); 
   * that surface wind is always first and cannot be removed;
   * list will be sorted for height (from bottom to top); 
   * all winds will have different heights.
   */
  class WindList {
    constructor(map) {
      this.map = map; 


      
      // 5 m/sec, west wind, h = 0m (surface wind)
      this.firstWind = new Wind(5, 0, 0);
      this.firstWind.arrow.setSelection(false);      
      // we add to map corresponding windsock
      this.firstWind.addToMap(this.map, this.map.getCenter());
      this.firstWind.arrow.removePlacemark();      
      
      this.currentWind = this.firstWind;
      this.lastWind = this.firstWind;
      this.numberOfWinds = 1;

      // Output window at the top left corner of the screen.    
      this.windOutput = new WindOutputElement(this.firstWind);
      this.map.controls.add(this.windOutput, {float: 'left'}); 
      
      console.log("ok");

      
            
      //this.printCurrentWindWindow();
      this.windOutput.print(this.currentWind);          
      
      this.firstWind.arrow.events.add('click', function(e) {
        if (this.numberOfWinds == 1) return;      
        if (this.currentWind != this.firstWind) {
          this.currentWind.arrow.setSelection(false);
          this.firstWind.arrow.setSelection(true);
          this.currentWind = this.firstWind;          
        }         
        this.printCurrentWindWindow();
        this.windOutput.print(this.currentWind);        
      }.bind(this));      
    }

    /**
     * Create new wind (value = 5, angle = 0, height is unknown) and 
     * add it to the end of the list.
     */
    addNewWind() {
      
      var wind = new Wind(5, 0, null);
      wind.addToMap(this.map);
           
      this.currentWind.arrow.setSelection(false);
      wind.arrow.setSelection(true);

      this.lastWind.nextWind = wind;      
      
      wind.prevWind = this.lastWind;
      wind.nextWind = null;
      
      this.lastWind = wind;
      this.currentWind = wind;
           
      wind.arrow.events.add('click', function(e) {               
        if (this.currentWind != wind) {
          this.currentWind.arrow.setSelection(false);
          wind.arrow.setSelection(true);
          this.currentWind = wind;          
        } 
        
        this.printCurrentWindWindow();
        this.windOutput.print(this.currentWind);         
      }.bind(this));       

      this.windOutput.print(this.currentWind); 
      
      this.numberOfWinds++;

      if (this.numberOfWinds == 2) {
        this.firstWind.arrow.addPlacemark();
      } 
      
    }
    
    
    removeCurrentWind() {
      
      // First wind, that is, surface wind, cannot be removed
      if (this.currentWind == this.firstWind) {
        console.warn("This wind was not removed, because it was firstWind.");
        return;
      }
      
      this.currentWind.removeFromMap(this.map);     
      this.removeCurrentWindFromList();

      if (this.numberOfWinds > 1) {
        this.currentWind.arrow.setSelection(true);
      } 

      if (this.numberOfWinds == 1) {
        this.firstWind.arrow.removePlacemark();        
      }      
           
      //this.printCurrentWindWindow();
      this.windOutput.print(this.currentWind);       
    }
    
    
    removeCurrentWindFromList() {
      
      // First wind, that is, surface wind, cannot be removed
      if (this.currentWind == this.firstWind) {
        console.warn("This wind was not removed, because it was firstWind.");
        return;
      }  
      
      var wind = this.currentWind;
      
      if (wind.nextWind != null) {
        wind.prevWind.nextWind = wind.nextWind;
        wind.nextWind.prevWind = wind.prevWind;          
      } else {
        // lastWind case
        wind.prevWind.nextWind = null;
        this.lastWind = wind.prevWind;         
      }
      
      this.currentWind = wind.prevWind;
                        
      this.numberOfWinds--;     
    }
    
    
    moveCurrentPointerToPrev() {
      if (this.numberOfWinds == 1) return;
      
      this.currentWind.arrow.setSelection(false);
      
      if (this.currentWind != this.firstWind) {
        this.currentWind = this.currentWind.prevWind;
      } else {
        this.currentWind = this.lastWind;
      }  

      this.currentWind.arrow.setSelection(true); 

      //this.printCurrentWindWindow();
      this.windOutput.print(this.currentWind);   
    }
    
    moveCurrentPointerToNext() {
      if (this.numberOfWinds == 1) return;
      
      this.currentWind.arrow.setSelection(false);
      
      if (this.currentWind != this.lastWind) {
        this.currentWind = this.currentWind.nextWind;
      } else {
        this.currentWind = this.firstWind;
        //console.log(this.currentWind.height);
      }

      this.currentWind.arrow.setSelection(true);
      
      //this.printCurrentWindWindow();
      this.windOutput.print(this.currentWind);             
    }
    
    /**
     * Set height to this.currentWind and 
     * then order WindList for heights. 
     * @param {number || null} height
     */ 
    setHeightToCurrentWind(height) {
      // We cannot change height for first (surface) wind 
      if (this.currentWind == this.firstWind) {
        throw("You cannot change height of this.firstWind!");
      }
      
      if ((typeof(height) == 'number') && (height <= 0)) {
        throw("Height of winds must be > 0!");
      }      
            
      var currentWind = this.currentWind;
      
      // If height is null we will move current wind 
      // to the end of list
      if (height == null) {
      
        // Case, when everything is already in right order      
        if ((currentWind == this.lastWind) ||      
            (currentWind.nextWind.getHeight() == null)) {
          currentWind.setHeight(height);
          this.windOutput.print(this.currentWind);
          
          return;
        }   
        
        this.removeCurrentWindFromList();
                
        this.lastWind.nextWind = currentWind;      
        
        currentWind.prevWind = this.lastWind;
        currentWind.nextWind = null;
        
        this.lastWind = currentWind;
        
        this.currentWind = currentWind;
        // we decreased  numberOfWinds previously in removeCurrentWind()     
        this.numberOfWinds++;

        this.currentWind.setHeight(height);         
        this.windOutput.print(this.currentWind);
        
        return(true);
      } else {
        // From previous it follows, that numberOfWinds > 1 
        // and height > 0
        
        this.removeCurrentWindFromList();
        
        var wind = this.firstWind;
        
        while(true) {
          
          wind = wind.nextWind;
          
          if (wind == null) {
            currentWind.prevWind = this.lastWind;
            this.lastWind.nextWind = currentWind;
            currentWind.nextWind = null;
            this.lastWind = currentWind;
            currentWind.setHeight(height);
            
            this.currentWind = currentWind;   
            this.numberOfWinds++;
            
            this.windOutput.print(this.currentWind);
            
            return;                        
          } 
          
          var windHeight = wind.getHeight();
                         
          // Such height already exists
          if (windHeight == height) return(false);
          
          if (windHeight == null || windHeight > height) {
            
            wind.prevWind.nextWind = currentWind;
            currentWind.prevWind = wind.prevWind;
                    
            wind.prevWind = currentWind;
            currentWind.nextWind = wind;
            
            currentWind.setHeight(height);
            
            this.currentWind = currentWind;            
            this.numberOfWinds++;

            this.windOutput.print(this.currentWind);
            
            return;        
          }                      
        }
      }
      
    }
    
    setCurrentAngle(angle) {
      this.currentWind.setAngle(angle);
      this.windOutput.print(this.currentWind);             
    }
    
    setCurrentValue(value) {
      this.currentWind.setValue(value);
      this.windOutput.print(this.currentWind);              
    }
    
   
    printCurrentWindWindow() {
      if (this.currentWind == this.firstWind) {
        $("#windHeightInput").prop("disabled", true);
        $("#removeWind").prop("disabled", true);          
      } else {
        $("#windHeightInput").prop("disabled", false);
        $("#removeWind").prop("disabled", false);
      }
      $("#windHeightInput").val(this.currentWind.getHeight());    
      $("#windDirectionInput").val(this.currentWind.getAngle());
      $("#windValueInput").val(this.currentWind.getValue());
      $("#arrowScale").prop("checked", this.currentWind.arrow.getIsScaled());      
    } 
       
  }
      
  provide(WindList);  
});