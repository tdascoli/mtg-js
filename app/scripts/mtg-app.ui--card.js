$( document ).ready(function() {
    $('.playground__player .mtg-card').click(function(){
        if (!$(this).hasClass('mtg-card--no-tap')) {
            $(this).toggleClass('mtg-card--tapped');
        }
    });

});