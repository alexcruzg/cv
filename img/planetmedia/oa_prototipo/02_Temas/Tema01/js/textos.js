$(document).ready(function () {

    $(".cont_1").click(function () {
        $('#cont1').fadeIn(250);
        $('#cont1').addClass('expandUp');
        $('.op3').addClass('fill_3');
         setTimeout(function(){ $('.op3').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.close').addClass('fadeIn');
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto1');

    })
    $(".cont_2").click(function () {
        $('#cont2').fadeIn(250);
        $('#cont2').addClass('expandUp');
        $('.op3').addClass('fill_3');
         setTimeout(function(){ $('.op3').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto4');

    })
    $(".cont_3").click(function () {
        $('#cont3').fadeIn(250);
        $('#cont3').addClass('expandUp');
        $('.op4').addClass('fill_4');
         setTimeout(function(){ $('.op4').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto2');
    })
    $(".cont_4").click(function () {
        $('#cont4').fadeIn(250);
        $('#cont4').addClass('expandUp');
        $('.op4').addClass('fill_4');
         setTimeout(function(){ $('.op4').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto2');

    })
    $(".cont_5").click(function () {
        $('#cont5').fadeIn(250);
        $('#cont5').addClass('expandUp');
        $('.op4').addClass('fill_4');
         setTimeout(function(){ $('.op4').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto2');

    })
    $(".cont_6").click(function () {
        $('#cont6').fadeIn(250);
        $('#cont6').addClass('expandUp');
        $('.op4').addClass('fill_4');
         setTimeout(function(){ $('.op4').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto3');

    })
    $(".cont_7").click(function () {
        $('#cont7').fadeIn(250);
        $('#cont7').addClass('expandUp');
        $('.op4').addClass('fill_4');
         setTimeout(function(){ $('.op4').addClass('after'); }, 250);
         $('.close').fadeIn();
         $('.diagrama').addClass('shadowDiagrama');
         $(this).addClass('visto3');


    })
    $('.close').click(function(){
        $(this).fadeOut(200);
        $('.diagrama').removeClass('shadowDiagrama');
        $('#cont1').fadeOut(200);
        $('#cont2').fadeOut(200);
        $('#cont3').fadeOut(200);
        $('#cont4').fadeOut(200);
        $('#cont5').fadeOut(200);
        $('#cont6').fadeOut(200);
        $('#cont7').fadeOut(200);

        $('.op3').removeClass('fill_3');
        $('.op3').removeClass('after');

        $('.op4').removeClass('fill_4');
        $('.op4').removeClass('after');



    })







    
    

})


/*$(document).ready(function () {

    $(".row3").click(function () {
        $(this).addClass('open');
        $('.op3').addClass('fill_3');
        $('.open p:nth-child(2)').slideDown();
         setTimeout(function(){ $('.op3').addClass('after'); }, 250);
    })

    $(".row4").click(function () {
        $(this).addClass('open2');
        $('.op4').addClass('fill_4');
        $('.open2 p:nth-child(2)').slideDown();
         setTimeout(function(){ $('.op4').addClass('after'); }, 250);
    })

    $('.close').click(function(){
        $('.row3 > p:nth-child(2)').slideUp(0);
        $('.op3').removeClass('after'); 
        $('.row3').removeClass('open');
        $('.op3').removeClass('fill_3');


        $('.row4 p:nth-child(2)').slideUp(0);
        $('.op4').removeClass('after');
        $('.row4').removeClass('open2');
        $('.op4').removeClass('fill_4');



    })


    
    

})*/