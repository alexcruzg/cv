$(document).ready(function () {
	function scroll_ (){

	}
	var c_note = 0;
	$('.trigger_note').click(function () {
		if (c_note==0) {
			$(this).addClass('rotate_');
			$('.box_note').addClass('box_note_shadow');
			$('.body_note').slideDown();
			c_note++;
		} else {
			$(this).removeClass('rotate_');
			$('.box_note').removeClass('box_note_shadow');
			$('.body_note').slideUp();
			c_note--;

		}
	})
})
