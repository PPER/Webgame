$('.phone_chat').draggable({ handle: 'header' });
$("#comment_card_button").click(function () {
    $(".phone_chat").fadeIn(300);
});

$(".pop_up_cross").click(function () {
    $(".phone_chat").fadeOut(300);
});