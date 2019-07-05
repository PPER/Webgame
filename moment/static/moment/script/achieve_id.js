$(document).ready(function (){
    var archiveId;
    document.getElementById("line_cre0").onclick=(function(){
        archiveId=1;
        upadateAchieveId();
        window.location.href="../story/";
        //console.log("button1 pressed");
    });
    document.getElementById("line_cre1").onclick=(function(){
        archiveId=2;
        upadateAchieveId();
        window.location.href="../story/";
    });
    document.getElementById("line_cre2").onclick=(function(){
        archiveId=3;
        upadateAchieveId();
        window.location.href="../story/";
    });
    //读取存档号
    function upadateAchieveId(){
        $.ajax({
            url: '/moment/define_archive_id/',
            type: 'post',
            data: {archive_id:archiveId},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                __ID=JSON.parse(res).archive;
            },
            error:function () {
    
            }
        })
    }

    //logout
    document.getElementById("galcate_logout").onclick=(function(){
        $("#promote_window_whole").toggle();
    document.getElementById("promote_title").innerHTML="【登出提示】";
    document.getElementById("promote_content").innerHTML="您将退出游戏。若想继续游戏请点击【取消】( •̀ ω •́ )y";
    document.getElementById("promote_cancel_btn").onclick=(function(){
        $("#promote_window_whole").toggle();
    })
    document.getElementById("promote_confirm_btn").onclick=(function(){
        $.ajax({
            url: '/moment/logout_view/',
            type: 'post',
            data: {},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                window.location.href="../";
            },
            error:function () {
            }
        })
    })
    })

})