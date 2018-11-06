// Create legend for direction range input
var directionPlateSpan = 5;
var directionPlateNumber = 4*directionPlateSpan + 1;

//$("#windDirectionInputScale").css({"width": 100 + "%"});

for(var i=0; i<directionPlateNumber; i++) {
  var str = "";
  switch (i) {
    case 0: 
      str = "В";
      break;
    case directionPlateSpan: 
      str = "С";
      break;
    case directionPlateSpan*2: 
      str = "З";
      break;      
    case directionPlateSpan*3: 
      str = "Ю";
      break;
    case directionPlateSpan*4: 
      str = "В";
      break;
    default:
      str = "&nbsp";          
  }
  $("#windDirectionInputScale").append("<div class='directionPlate'>" + str + "</div>");                
}
$(".directionPlate").css({
  "width": 100/(directionPlateNumber) + "%",
  "float": "left", 
  "text-align": "center"
});