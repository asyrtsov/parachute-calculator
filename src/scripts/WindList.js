ymaps.modules.define('WindList', [
  'Wind', 
  'WindOutputElement', 
  'Output'
],
function(provide, Wind, WindOutputElement, Output) {

  /**
   * List of winds at different heights; 
   * always contains wind at height = 0m (surface wind); 
   * that surface wind is always first and cannot be removed;
   * list will be sorted for height (from bottom to top); 
   * all winds should have different heights.
   * WindList also contains WindOutputElement for showing 
   * parameters of current wind.
   * WindList contains function printCurrentWindWindow() 
   * for printing parameters of current window to wind dialog window; 
   * you should make this printing by hand (that is, call 
   * that function when you need).
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
      this.windOutput.print(this.currentWind);

      this.calculator = null;
      this.path = null;       
      
      
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
    
       
    setCalculator(calculator) {
      this.calculator = calculator;      
    }
    
    setPath(path) {
      this.path = path;
    }

    /**
     * Create new wind (value = 5, angle = 0, height is unknown) and 
     * add it to the end of the list.
     */
    addWind(point = null) {
      
      var wind = new Wind(5, 0, null);
      wind.addToMap(this.map, point);
           
      this.currentWind.arrow.setSelection(false);
      wind.arrow.setSelection(true);

      this.lastWind.nextWind = wind;      
      
      wind.prevWind = this.lastWind;
      wind.nextWind = null;
      
      this.lastWind = wind;
      this.currentWind = wind;
                      
      var clickNumber = 0;
      
      wind.arrow.events.add('click', function(e) {
        e.stopPropagation();  // remove standart zoom for click

        clickNumber++;
        if (clickNumber == 1) {
          setTimeout(function() {        
            if (clickNumber == 1) {  // Single Click (selection arrow)
              
              if (this.currentWind != wind) {
                this.currentWind.arrow.setSelection(false);
                wind.arrow.setSelection(true);
                this.currentWind = wind;          
              }
              
              
              //console.log(wind.arrow.geometry.getCoordinates()); 
              

              this.printCurrentWindWindow();
              this.windOutput.print(this.currentWind);
              
            } else {  // Double Click (deletion of arrow which was double clicked)
              this.removeWind(wind);
              if (this.numberOfWinds == 1) {
                $("#menuArrow").removeClass("arrow_selected");
                $("#menuArrow").addClass("arrow"); 
              }               
            }
                                               
            clickNumber = 0;
            
          }.bind(this), 200);
        }          
      }.bind(this));
            
      // remove standart map zoom for double click
      wind.arrow.events.add('dblclick', function(e) {
        e.stopPropagation();  
      });      
    
      this.windOutput.print(this.currentWind);       
      this.numberOfWinds++;
      
      if (this.numberOfWinds == 2) {
        this.firstWind.arrow.addPlacemark();
      }       
    }
    
    
    /**
     * Remove wind from WindList. If wind equals currentWind then 
     * after removing currentWind will be equal currentWind.prevWind.
     * Note: you cannot remove firstWind by construction.
     * @param {Wind} wind - It is supposed that wind belongs to WindList.  
     */
    removeWind(wind) {
      
      // First wind, that is, surface wind, cannot be removed
      if (wind == this.firstWind) {
        console.warn("This wind was not removed, because it was firstWind.");
        return;
      }
      
      wind.removeFromMap(this.map);     

      wind.prevWind.nextWind = wind.nextWind;      
      if (wind != this.lastWind) {
        wind.nextWind.prevWind = wind.prevWind;
      } else {
        this.lastWind = wind.prevWind;
      }
      
      if (wind == this.currentWind) {
        this.currentWind = wind.prevWind;
        if (this.numberOfWinds > 1) {
          this.currentWind.arrow.setSelection(true);
        } 
        this.printCurrentWindWindow();
        this.windOutput.print(this.currentWind);        
      }
                                    
      this.numberOfWinds--;       
      
      if (this.numberOfWinds == 1) {
        this.firstWind.arrow.removePlacemark();
        this.currentWind.arrow.setSelection(false);        
      }

      this.calculator.calculateHeight();
      Output.print(this.calculator, this.path);            
    }
    
    
    moveCurrentPointer(wind) {      
      if (wind == this.currentWind) return;      
      this.currentWind.arrow.setSelection(false);            
      this.currentWind = wind;
      this.currentWind.arrow.setSelection(true); 
      this.windOutput.print(this.currentWind);  
      //this.printCurrentWindWindow();      
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
      }
      this.currentWind.arrow.setSelection(true);      
      //this.printCurrentWindWindow();
      this.windOutput.print(this.currentWind);             
    }
    
    /**
     * Set height to this.currentWind and then order WindList for heights 
     * (increasing order, null is greater then number);
     * you cannot change height of first wind (0) by construction.
     * @param {number || null} height - Height of wind; if it is number then must be > 0.
     * @return {boolean} - False if it is impossible to set this height 
     * (height is a number and such height has already existed).
     */ 
    setHeightToCurrentWind(height) {
      // We cannot change height for first (surface) wind by construction 
      if (this.currentWind == this.firstWind) {
        throw("You cannot change height of this.firstWind!");
      }
      
      if ((typeof(height) == 'number') && (height <= 0)) {
        throw("Height of winds must be > 0!");
      }      
               
      // Different cones must have different heights  
      if (typeof(height) == 'number') {  
        var wind = this.firstWind;        
        while(true) {
          if ((wind != this.currentWind) && (wind.getHeight() == height)) { 
            return(false);
          }            
          if ((wind == this.lastWind) || (wind.getHeight() == null)) break;          
          wind = wind.nextWind;         
        }
      }     
                        
      var currentWind = this.currentWind;
      
      this.currentWind.setHeight(height);         
      this.windOutput.print(this.currentWind);
            
      var wind = this.currentWind;
 
      // Order windList by heights (increasing order, 
      // null values are greater than numbers)               
      if (height == null) {         
        while(true) {          
          if (wind.nextWind == null || wind.nextWind.getHeight() == null) break;
          var wind = wind.nextWind;        
        }
         
        this.moveWind(currentWind, wind);
              
      } else {  // height is a number
        
        // Moving in previous order
        if (wind.prevWind.getHeight() == null || 
            height < wind.prevWind.getHeight()) {  
        
          while(true) {
            if (wind.prevWind.getHeight() != null) break; 
            wind = wind.prevWind;       
          }
              
          while(true) {
            if (height > wind.prevWind.getHeight()) break;
            wind = wind.prevWind;
          }
          
          this.moveWind(currentWind, wind.prevWind);
          
        } else {
                
          while(true) {
            if (wind.nextWind == null || wind.nextWind.getHeight() == null ||
                height < wind.nextWind.getHeight()) break;
            wind = wind.nextWind;    
          }
          
          this.moveWind(currentWind, wind);        
        }                        
      }
      
      return(true);            
    }
    
    /**
     * Move windA to be next wind for windB.
     * Remember, that in WindList first wind always exists. 
     */
    moveWind(windA, windB) {
      if (windA == windB || windA == windB.nextWind) return;
              
      if (windB == this.lastWind) {
        
        windA.nextWind.prevWind = windA.prevWind;
        windA.prevWind.nextWind = windA.nextWind;        
                
        windB.nextWind = windA;
        windA.prevWind = windB;

        this.lastWind = windA;         
      } else if (windA == this.lastWind) {
        
        this.lastWind = windA.prevWind;
        windA.prevWind.nextWind = null;        

        windA.nextWind = windB.nextWind;        
        windB.nextWind.prevWind = windA;
        
        windA.prevWind = windB;
        windB.nextWind = windA;              
      } else {  // both windA and windB are not lastWind
        
        windA.nextWind.prevWind = windA.prevWind;
        windA.prevWind.nextWind = windA.nextWind;         
        
        windA.nextWind = windB.nextWind;        
        windB.nextWind.prevWind = windA;

        windA.prevWind = windB;
        windB.nextWind = windA;                    
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
    
    /**
     * It is good idea not to use this function in WindList methods
     * (because it uses outer objects); use this function beyond WindList class.
     */
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
      var angle = this.currentWind.getAngle();
      $("#menuArrow").css("transform", "rotate(" + (-1)*angle + "deg)");
      $("#menuWindValue").html(this.currentWind.getValue() + " м/с");      
    } 
       
  }
      
  provide(WindList);  
});