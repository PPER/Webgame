$(document).ready(function(){
    var currentHealth;
    var currentLove;
    var currentMoney;
    var loveChange;
    var healthChange;
    var moneyChange;
    var openMark=0;
    $("#navbar").on("click", function() {
        if (openMark==1){
            $(".overlay").removeClass("is-on");
            $(".nveMenu").removeClass("is-opened");
            openMark=0;
        }
        openMark=1;
        $(".nveMenu").addClass("is-opened");
        $(".overlay").addClass("is-on");
        $.ajax({
            url: '/moment/story_navigation/',
            type: 'post',
            data: {},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response = JSON.parse(res);
                currentHealth=response.current_health;
                currentLove=response.current_love;
                currentMoney=response.current_money;
                loveChange=response.love_change;
                moneyChange=response.money_change;
                healthChange=response.health_change;
                //console.log("s收到的health："+currentHealth+"  changehealt:"+healthChange);
                document.getElementById("current_health").innerHTML=response.current_health;
                document.getElementById("current_love").innerHTML=response.current_love;
                document.getElementById("current_money").innerHTML=response.current_money;

                if (response.health_change==0){
                    document.getElementById("health_change").innerHTML='';
                }
                if (response.health_change<0){
                    document.getElementById("health_change").innerHTML=response.health_change;
                    document.getElementById("health_change").className="badge badge-success";
                }
                if (response.health_change>0){
                    document.getElementById("health_change").innerHTML=response.health_change;
                    document.getElementById("health_change").className="badge badge-error";
                }

                if (response.love_change==0){
                    document.getElementById("love_change").innerHTML='';
                }
                if (response.love_change<0){
                    document.getElementById("love_change").innerHTML=response.love_change;
                    document.getElementById("love_change").className="badge badge-success";
                }
                if (response.love_change>0){
                    document.getElementById("love_change").innerHTML=response.love_change;
                    document.getElementById("love_change").className="badge badge-error";
                }

                if (response.money_change==0){
                    document.getElementById("money_change").innerHTML='';
                }
                if (response.money_change<0){
                    document.getElementById("money_change").innerHTML=response.money_change;
                    document.getElementById("money_change").className="badge badge-success";
                }
                if (response.money_change>0){
                    document.getElementById("money_change").innerHTML=response.money_change;
                    document.getElementById("money_change").className="badge badge-error";
                }
                if (response.money_change==0 && response.health_change==0 && response.love_change==0){
                    document.getElementById("navbar_hint_circle").style.background="green";
                }
                else {
                    document.getElementById("navbar_hint_circle").style.background="red";
                }

                //document.getElementById("record").innerHTML=JSON.parse(res).love;
            },
            error:function () {
            }
        }) 

      });
      
      $(".overlay").on("click", function() {
        $(this).removeClass("is-on");
        $(".nveMenu").removeClass("is-opened");
      });

    //攻略
    document.getElementById("nav_guid").onclick=(function(){
        document.getElementById("hint_title").innerHTML="【Guid】";
        document.getElementById("hint_content").innerHTML="【About Game】<br>1.It may take a while for loading. To speed up the game, it's better not to clear the browser cache;<br>2.Please click the 【Logout】 or 【Save】 before exiting the game. Though the game will auto-save for every 5 minutes, but you may lose part of records if you close the browser directly. <br>【Others】<br>1.If you click【Back】. Fancy Card obtained before clicking may not be deleted. The developer will fix it in further version. <br>2.The Card product in the store all have positive expectation, so it's worthy to buy them. <br>3.You have 2 chances to lucky draw every day. You can see it in【Achievement】->【Store】->the third button on the right;<br>4.There is hyperlink on Namecards, you can click them. <br>5.Some branch selections lead to different storylines, but they may or may not return to the same story line.";
        $("#hint_window_whole").toggle();
    })

    //logout
    document.getElementById("nav_log_out").onclick=(function(){
        $("#promote_window_whole").toggle();
        document.getElementById("promote_title").innerHTML="【Logout】";
        document.getElementById("promote_content").innerHTML="You are going to exit the game, the record has been saved. If you want to continue the game, please click the button【Cancel】( •̀ ω •́ )y";
        document.getElementById("promote_cancel_btn").onclick=(function(){
            $("#promote_window_whole").toggle();
        })
        document.getElementById("promote_confirm_btn").onclick=(function(){
            saveArch();
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

      //number change

      $.fn.numberChange = function(options) {
        var settings = $.extend(
          {
            wait: 1000,
            duration: 1000,
            startValue: 100,
            endValue: 0,
            prefix: "",
            easing: "swing"
          },
          options
        );
      
        var that = this;
        that.html(settings.prefix + settings.startValue);
      
        $({ number: settings.startValue })
          .delay(settings.wait)
          .animate(
            { number: settings.endValue },
            {
              duration: settings.duration,
              easing: settings.easing,
              step: function(now, tween) {
                that.html(settings.prefix + Math.floor(now));
              }
            }
          );
      
        return this;
      };
      
      
      $("#health_change").click(function() {
        $("#current_health").numberChange({
          easing: 'easeOutSine',
          wait: 0,
          duration: 2000,
          prefix:'',
          startValue: currentHealth,
          endValue: currentHealth+healthChange,
        });
        healthChange=0;
        $.ajax({
            url: '/moment/story_navigation/',
            type: 'post',
            data: {'health_change':healthChange,'love_change':loveChange,'money_change':moneyChange},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                document.getElementById("health_change").innerHTML='';
                flushHintCircle();
            }
        })
      })

      $("#love_change").click(function() {
        $("#current_love").numberChange({
          easing: 'easeOutSine',
          wait: 0,
          duration: 2000,
          prefix:'',
          startValue: currentLove,
          endValue: currentLove+loveChange,
        });
        loveChange=0;
        $.ajax({
            url: '/moment/story_navigation/',
            type: 'post',
            data: {'health_change':healthChange,'love_change':loveChange,'money_change':moneyChange},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                document.getElementById("love_change").innerHTML='';
                flushHintCircle();
            }
        })
      })

      $("#money_change").click(function() {
        $("#current_money").numberChange({
          easing: 'easeOutSine',
          wait: 0,
          duration: 2000,
          prefix:'',
          startValue: currentMoney,
          endValue: currentMoney+moneyChange,
        });
        moneyChange=0;
        $.ajax({
            url: '/moment/story_navigation/',
            type: 'post',
            data: {'health_change':healthChange,'love_change':loveChange,'money_change':moneyChange},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                document.getElementById("money_change").innerHTML='';
                flushHintCircle();
            }
        })
      })

        
})