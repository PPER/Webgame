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
        document.getElementById("hint_title").innerHTML="【攻略】";
        document.getElementById("hint_content").innerHTML="【关于游戏】<br>1.Loading时间可能较长，加快速度，下次进入前不要清浏览器缓存;<br>2.退出游戏前请点击【保存】or【退出游戏】，不要直接关闭浏览器。游戏会每隔5min自动保存，但是直接退出会造成进度不follow。<br>【其他】<br>1.由于内置bug，点击【人生重来一次】，图鉴不会被收回，该bug可能在下一版本修复;<br>2.商店里的卡们期望都是正的;<br>3.每天有2次抽卡机会，在【成就与商店】->【商店】的右侧第三个按钮;<br>4.名片的名字是个超链接，可以点开看属性;<br>5.选择符合历史的选择支可以获得更多奖励，有些选择支会自动回归到另一个保证剧情流畅。";
        $("#hint_window_whole").toggle();
    })

    //logout
    document.getElementById("nav_log_out").onclick=(function(){
        $("#promote_window_whole").toggle();
        document.getElementById("promote_title").innerHTML="【登出提示】";
        document.getElementById("promote_content").innerHTML="您将退出游戏，本存档将自动保存。若继续游戏请点击【取消】( •̀ ω •́ )y";
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