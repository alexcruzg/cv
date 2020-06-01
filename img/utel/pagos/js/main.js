$(document).ready(function () {
	let c = 0;
	$('.toggle').click(function () {
		if (c == 0 ) {
			$('.detalles__').slideDown();
			$(this).addClass('rotate');
			c = 1;
		} else {
			$('.detalles__').slideUp();
			$(this).removeClass('rotate');

			c = 0;


		}

	})

	$('.overly, .close, #regresar').click(function () {
		$('.overly').fadeOut();
		$('.modal').fadeOut();
		console.log(4);

	})

})