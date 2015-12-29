jQuery(document).ready(function(){					
 "use strict";
	 jQuery('.title-wrap, .subtitle-wrap').each(function() {
        jQuery(this).data('wrapping', jQuery(this).width());
        jQuery(this).css('width', 0);
     });

      jQuery('.images').hoverIntent(function() {
        jQuery(this).find('.title-wrap').stop().each(function() {
          jQuery(this).animate({
            width: jQuery(this).data('wrapping')
          }, 15000);
      	});
        jQuery(this).find('.subtitle-wrap').stop().each(function() {
          jQuery(this).delay(250).animate({
            width: jQuery(this).data('wrapping')
          }, 15000);
        });
      }, function() { 
        jQuery(this).find('.title-wrap').stop().each(function() {
          jQuery(this).animate({
            width: 0
          }, 15000);
      	});
        jQuery(this).find('.subtitle-wrap').stop().each(function() {
          jQuery(this).animate({
            width: 0
          }, 15000);
        });
      });
	  
	  jQuery('.images').hover(function() {
			 jQuery(this).find('.hidden-infos').stop().fadeToggle(250);
			 
	   });
	  
 
});