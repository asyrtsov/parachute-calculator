ymaps.modules.define('BoundaryHeights', ['Constant'],
function(provide, Constant) {
  
  /**
   * Object consists of three varialables: startHeight, finalHeight and 
   * calculationDirection.
   * StartHeight is a height of first vertex of Path.
   * FinalHeight is a height of last vertex of Path.   
   * StartHeight and finalHeight can have following values: number or null.
   * CalculationDirection has boolean value. If it equal to true, 
   * calculation will be made from first vertex of Path to last vertex, 
   * otherwise - from last vertex to first vertex.   
   * StartHeight and finalHeight have connection to html &lt; input &gt; 
   * elements $("#startHeight") and $("#finalHeight").
   * CalculationDirection has connection to $("#calculationDirection") 
   * checkbox element. In constructor, we create two-side connection 
   * between those varialables and html elements.   
   */
  class BoundaryHeights {

    constructor() {
      // Value must be null or number
      this.startHeight = null;
      this.finalHeight = null;
      
      // Value must be bool
      this.calculationDirection = Constant.defaultCalculationDirection;
      $("#calculationDirection").prop("checked", !this.calculationDirection);
            
      // This objects should be set up by 
      // setPath() and setCalculator() methods
      this.path = null;
      this.calculator = null;
      
      this.setDefaultHeights();      
      this.startProcessingHeightFields();
      this.startProcessingCalculationDirectionField();      
    }
    
    getCalculationDirection() {
      return this.calculationDirection;
    }
    
    setCalculationDirection(calculationDirection) {
      this.calculationDirection = calculationDirection;      
    }
    
        
    setPath(path) {
      this.path = path;
    }
    
    setCalculator(calculator) {
      this.calculator = calculator;
    }
    
    
    /**
     * @param {boolean} calculationDirection
     */    
    setDefaultHeights() {
      if (this.calculationDirection) {
        this.setStartHeight(Constant.defaultStartHeight);
        this.setFinalHeight(Constant.defaultStartHeight);
      } else {
        this.setStartHeight(Constant.defaultFinalHeight);
        this.setFinalHeight(Constant.defaultFinalHeight);        
      }
      
      this.setPropDisabled();    
    } 
    
    /**
     * Disable/enable heights field with dependence of 
     * calculationDirection.
     */
    setPropDisabled() {
      $("#startHeight").prop("disabled", !this.calculationDirection);
      $("#finalHeight").prop("disabled", this.calculationDirection);            
    }

    /**
     * @param {(number | null)} finalHeight
     */    
    setStartHeight(startHeight) {
      this.startHeight = startHeight;
      this.printStartHeight();
    }
    
    printStartHeight() {
      if (this.startHeight != null) {
        $("#startHeight").val(Math.floor(this.startHeight));
      } else {
        if (this.calculationDirection) {
          $("#startHeight").val("");  
        } else {
          $("#startHeight").val("не определена");
        }  
      }                
    }
    
    /**
     * @param {(number | null)} finalHeight
     */
    setFinalHeight(finalHeight) {
      this.finalHeight = finalHeight;
      this.printFinalHeight(); 
    }

    printFinalHeight() {
      if (this.finalHeight != null) {
        $("#finalHeight").val(Math.floor(this.finalHeight));
      } else {        
        if (this.calculationDirection) {
          $("#finalHeight").val("не определена");  
        } else {
          $("#finalHeight").val("");
        }  
      }                
    }        
    
    
    makeHeightsEqual() {
      if (this.calculationDirection) {
        this.setFinalHeight(this.startHeight);        
      } else {
        this.setStartHeight(this.finalHeight);  
      }      
    }
    
    
    startProcessingHeightFields() {
      
      $("#startHeight").change(function () {       
        var s = $("#startHeight").val();
        var n = Number.parseInt(s);
        if ((n >= 0) && (n <= Constant.maxHeight)) {
          
          this.startHeight = n;
          this.printStartHeight();
     
          if (this.path.length > 0) {  
            this.calculator.calculateHeight();
            this.path.printHeightsAndWindPoints();
          } 
        } else {
          this.printStartHeight();
        }
      }.bind(this));

      
      $("#finalHeight").change(function () {       
        var s = $("#finalHeight").val();
        var n = Number.parseFloat(s);
        if ((n >= 0) && (n <= Constant.maxHeight)) {
          this.finalHeight = n;
          this.printFinalHeight();
          
          if (this.path.length > 0) {
            this.calculator.calculateHeight();
            this.path.printHeightsAndWindPoints();                       
          } 
        } else {
          this.printFinalHeight();
        }    
      }.bind(this));    
    }  


    startProcessingCalculationDirectionField() { 
  
      $("#calculationDirection").change(function() {
        var isChecked = $("#calculationDirection").prop("checked");
        this.calculationDirection = !isChecked;
        this.setPropDisabled();
                
        if (this.path.length > 0) {         
          this.calculator.calculateHeight();
          this.printStartHeight();
          this.printFinalHeight();
          this.path.printHeightsAndWindPoints();              
        } else {           
          this.makeHeightsEqual();         
        }                              
      }.bind(this));     
    } 
  } 
  provide(BoundaryHeights);  
});   