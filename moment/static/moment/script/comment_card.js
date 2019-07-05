$(document).ready(function () {

    $("#comment_card_button").click(function () {
        $("#comment_card").fadeIn(300);
        $(".overlay_whole").addClass("is-on");
    });

    $("#comment_card_icon").click(function () {
        $("#comment_card").fadeOut(300);
        $(".overlay_whole").removeClass("is-on");
    });
    $.fn.commentCards = function(){

        return this.each(function(){
      
          var $this = $(this),
              $comment_card_cards = $this.find('.comment_card_card'),
              $current = $comment_card_cards.filter('.comment_card_card--current'),
              $next;
      
          $comment_card_cards.on('click',function(){
            if ( !$current.is(this) ) {
              $comment_card_cards.removeClass('comment_card_card--current comment_card_card--out comment_card_card--next');
              $current.addClass('comment_card_card--out');
              $current = $(this).addClass('comment_card_card--current');
              $next = $current.next();
              $next = $next.length ? $next : $comment_card_cards.first();
              $next.addClass('comment_card_card--next');
            }
          });
      
          if ( !$current.length ) {
            $current = $comment_card_cards.last();
            $comment_card_cards.first().trigger('click');
          }
      
          $this.addClass('comment_card_cards--active');
      
        })
      
      };
      
      $('.comment_card_cards').commentCards();
});
