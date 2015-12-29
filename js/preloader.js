var canvas = document.getElementById("preloaderCanvas");
	var context = canvas.getContext("2d");
	      context.beginPath();
	      context.moveTo(0,0);
	      context.lineTo(200,0);
	      context.lineTo(0,200);
	      context.stroke();
	      context.lineWidth = 0;
	      context.fillStyle = '#000';
	      context.fill();
	      context.strokeStyle = '#000';
	      context.stroke();



jQuery(window).load(function() {
"use strict";
			setTimeout(function(){
				$('#preloader').addClass('hide-preloader');
				$('body').removeClass('to-right')
			},500);
		});

