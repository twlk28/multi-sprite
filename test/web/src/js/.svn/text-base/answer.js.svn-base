seajs.use(['mobi/mo/1.0.0/mo','mobi/zepto/1.1.3/zepto'], function(mo, zepto){
   
	var mo = mo,
		$ = zepto;

	//radio改变
	var radioChange = function(ob,radioNum){
		ob.find("li").removeClass('selected');
		ob.find('[data-index="'+ radioNum +'"]').addClass('selected');
		$('input[type="hidden"]').val(parseInt( radioNum ));
	}

	$("#radio-list").on('click', 'li', function(event) {
		var radioNum = $(this).attr("data-index");
		radioChange($("#radio-list"),radioNum);
		event.preventDefault();
		/* Act on the event */
	});

});