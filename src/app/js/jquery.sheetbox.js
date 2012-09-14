(function($) {
	$.sheetbox = function(url,data,options) {
		$.sheetbox.defaultOptions = {
			layout: 'top',
			speed: 500,
			closeButton: false,
			closeOnSelfClick: true,
			closeOnSelfOver: false,
			force: false,
			onShow: false,
			onShown: false,
			onClose: false,
			onClosed: false,
			buttons: false,
			modal: false,
            modalBackground:'#000000',
            modalOpacity:0.7,
			width: 300,
			height:300
	    };

        options = $.extend($.sheetbox.defaultOptions, options);
        
        $(".sheetbox_"+options.layout).remove();
        var template = $('<div class="sheetbox" style="position:fixed;z-index:9999;"></div>');
        $(template).addClass('sheetbox_'+ options.layout);
        $("body").append($(template));

        if(options.layout == 'top'){
            $(template).css("top",(0-options.height)+"px");
            $(template).css("left","0px");
            $(template).css("height",options.height+"px");
            $(template).css("width","100%");
            $(template).animate({top:0},options.speed);
        }else if(options.layout == 'bottom'){
            $(template).css("bottom",(0-options.height)+"px");
            $(template).css("left","0px");
            $(template).css("height",options.height+"px");
            $(template).css("width","100%");
            $(template).animate({bottom:0},options.speed);
        }if(options.layout == 'left'){
            $(template).css("left",(0-options.width)+"px");
            $(template).css("top","0px");
            $(template).css("height","100%");
            $(template).css("width",options.width+"px");
            $(template).animate({left:0},options.speed);
        }if(options.layout == 'right'){
            $(template).css("right",(0-options.width)+"px");
            $(template).css("top","0px");
            $(template).css("height","100%");
            $(template).css("width",options.width+"px");
            $(template).animate({right:0},options.speed);
        }
        
        var onShow = null;
        if(options.onShow)
        	onShow = options.onShow;

        var onShown = null;
        if(options.onShown)
        	onShown = options.onShown;

        if(options.modal){
            $("body").append('<div id="sheetboxWrapper" style="width:100%;height:100%;background:'+options.modalBackground+';opacity:'+options.modalOpacity+'; -moz-opacity:'+options.modalOpacity+'; -webkit-opacity:'+options.modalOpacity+'; -khtml-opacity: 0.5;z-index:999;position:fixed;top:0px;left:0px;"></div>');
            $("#sheetboxWrapper").click(function(){
                $("#sheetboxWrapper").animate({opacity:0,display:'none'},function(){$(this).remove();});
                $(".sheetbox_"+options.layout).animate({opacity:0,display:'none'},function(){$(this).remove();});
            });
        }

        $.post(url,data,function(data){
            $(template).html(data);
	        if(options.layout == 'top'){
	            $(template).animate({top:0},options.speed,onShown);
	        }else if(options.layout == 'bottom'){
	            $(template).animate({bottom:0},options.speed,onShown);
	        }if(options.layout == 'left'){
	            $(template).animate({left:0},options.speed,onShown);
	        }if(options.layout == 'right'){
	            $(template).animate({right:0},options.speed,onShown);
	        }
            onShow();
        },'html');
	};

	$.sheetbox.close = function(layout,callback) {
        $("#sheetboxWrapper").animate({opacity:0,display:'none'},function(){$(this).remove();});
        $(".sheetbox_"+layout).animate({opacity:0,display:'none'},function(){$(this).remove();if(callback) callback();});
	};
})(jQuery);