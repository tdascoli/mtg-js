$( document ).ready(function() {
    // functions
    function checkCardForStack(card,path){
        var equal=false;
        var stack = $($.parseHTML('<div class="mtg-card-stack"></div>'));

        $(path+' .mtg-card').each(function(){
            if ($(this).attr('data-card-name')!==undefined && card.attr('data-card-name')===$(this).attr('data-card-name')){
                equal=true;
                $(this).after(card.detach());
                $(this).addClass('mtg-card--stacked');
                card.addClass(' mtg-card--stacked');
            }
        });

        if (!equal){
            stack.append(card.detach());
            stack.appendTo(path);
        }
    }
    // play from hand.
    function playFromHand(card){
        // main phase 1 or 2
        if ($('.phase-bar li[data-phase="m1"]').hasClass('current') || $('.phase-bar li[data-phase="m2"]').hasClass('current') && $(this).hasClass('mtg-card--hand')) {
            card.removeClass('mtg-card--hand');
            card.addClass('mtg-card--battlefield');

            var path = ".playground__player .playground--other";
            if (card.attr('data-card-types')==='creature'){
                path = '.playground__player .playground--creatures .playground-container';
            }
            else if (card.attr('data-card-types')==='land') {
                path = '.playground__player .playground--permanents .playground--land';
            }
            checkCardForStack(card,path);
        }
    }

    // tap own playground
    function tapOwnCard(card){
        if (!card.hasClass('mtg-card--no-tap')) {
            card.toggleClass('mtg-card--tapped');
        }
    }

    $('.mtg-card').click(function(){

        if ($(this).hasClass('mtg-card--hand')){
            console.log('play from hand');
            playFromHand($(this));
        }
        else if ($(this).hasClass('mtg-card--battlefield')){
            console.log('tap own card');
            tapOwnCard($(this));
        }

    });

    $('.toggle-playground').click(function(){
        var playground = '.playground__'+$(this).attr('data-playground');

        $('.playground__hand').addClass('playground--hide');
        $('.playground__graveyard').addClass('playground--hide');
        $('.playground__exile').addClass('playground--hide');

        $(playground).toggleClass('playground--hide');
    });
});