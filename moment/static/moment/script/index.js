//index界面一些button define
document.getElementById("index_login").onclick=(function(){
    window.location.href="./login_view/";
  })
document.getElementById("index_intro").onclick=(function(){
    $("#own_window_whole").toggle();
  })

document.getElementById("own_close_icon").onclick=(function(){
    $("#own_window_whole").toggle();
})