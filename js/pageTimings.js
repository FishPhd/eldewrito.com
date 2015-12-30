jQuery(window).load(function () {
    "use strict";
    setTimeout(function () {
        $("#h2-1").animate({ opacity: 0 });
        $("#h2-2").animate({ opacity: 0 });
        $("#h2-3").animate({ opacity: 0 });
        $("#h2-4").animate({ opacity: 0 });
        $("#form-1").animate({ opacity: 0 });
		$("#form-2").animate({ opacity: 0 });
    }, 100);

	/*Animate the words on the home page
    setTimeout(function () {
        $("#h2-1").animate({ opacity: 1 }, 3000);
    }, 1500);
    setTimeout(function () {
        $("#h2-2").animate({ opacity: 1 }, 3000);
    }, 2500);
    setTimeout(function () {
        $("#h2-3").animate({ opacity: 1 }, 3000);
    }, 3500);
    setTimeout(function () {
        $("#h2-4").animate({ opacity: 1 }, 3000);
    }, 4500);
    */
    setTimeout(function () {
        $("#form-1").animate({ opacity: 1 });
    }, 1500);
    /*
	setTimeout(function () {
        $("#form-2").animate({ opacity: 1 });
    }, 4250);
    */
	//Animate the lines on the home page
	setTimeout(function(){
	$("#homeDividerLine-1")
    /**.delay(500)
	.velocity({ x: "+=600", y: "25%" })
    .velocity({ fillGreen: 255, strokeWidth: 0 })
	.velocity({ height: 50, width: 50 })
    .velocity({ rotateZ: 90, scaleX: 0.5 })
    .velocity("reverse", { delay: 250 });**/
	
	.delay(200)
	.velocity({ x: "0%", y: "0%", width: "100%"});
	},2000);
	
	setTimeout(function(){
	$("#homeDividerLine-2")
    /**.delay(500)
	.velocity({ x: "+=600", y: "25%" })
    .velocity({ fillGreen: 255, strokeWidth: 0 })
	.velocity({ height: 50, width: 50 })
    .velocity({ rotateZ: 90, scaleX: 0.5 })
    .velocity("reverse", { delay: 250 });**/
	
	.delay(200)
	.velocity({ x: "0%", y: "0%", width: "100%"});
	},1000);
	
});