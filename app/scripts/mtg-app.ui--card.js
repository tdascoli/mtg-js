$( document ).ready(function() {
    var cardStacked=10;
    
    $('.card--stacked').each(function(i,object){
        $(object).css('transform','translate('+(cardStacked*i)+'px,0)');
    });
});