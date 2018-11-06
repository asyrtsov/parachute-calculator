//var valueScaleSpan = 5;
var maxWindVelocity = 10;
//var valueScaleNumber = maxWindVelocity*valueScaleSpan + 1;

for(var i=0; i<maxWindVelocity + 1; i++) {    
  $("#windValueInputScale").append("<div class='valueScale' id='v" + i + "'>" + i + "</div>");
}

$(".valueScale").css({
  "width": 100/(maxWindVelocity + 0.38) + "%",
  "float": "left",
  "text-align": "left"
});

$("#v" + (maxWindVelocity - 1)).css({
  "width": 100/(maxWindVelocity*2) + "%"
}); 

$("#v" + maxWindVelocity).css({
  "width": 100/(maxWindVelocity*1.25) + "%",
  "float": "left",
  "text-align": "right"
});  