var fakeMsg, fakeNum, isTyping, messages, uctTimer,contactName;
var _amount;
var contact_name_repo=new Array();
var contact_full_name_repo= new Array();
var contact_fakeMsg=new Array;
var chatLog= new Array();
var chat_repo=new Array(); //chat log集合 我为什么要写back功能啊呜呜
//下面是chat_window
//通讯录完善
messages = $(".messages-content");
fakeNum = 0;

contactName="";

isTyping = true;

uctTimer = null;

chatPic="";
initialGenMark=0;
generate_contact();
$("#phone").click(function () {
  if(contactName){
    document.getElementById('mCSB_1_container').innerHTML=" ";
    $.ajax({
      url: '/moment/chat_log/',
      type: 'post',
      data: {contactName:contactName},
      async:false,
      csrfmiddlewaretoken:'{{ csrf_token }}',
      success: function (res) {
          response=JSON.parse(res);
          document.getElementById("contact_name").innerHTML=response.chat_full_name;
          chatContent=response.chat_log;
          chatLog=chatContent.split("@");
          for(j=0;j<chatLog.length;j++){
            if(chatLog[j][0]=="o"){
              msg = $("<div>").addClass("message");
              msg.text(chatLog[j].slice(1));
              msg.appendTo($('.mCSB_container'));
              updateScrollbar();
            }
            if(chatLog[j][0]=="u"){
              msg = $("<div>").addClass("message");
              msg.text(chatLog[j].slice(1));
              msg.addClass("personal").appendTo($('.mCSB_container'));
              updateScrollbar();
            }
          }
          chatPic=response.chat_pic;
          document.getElementById("profile_avatar").src=chatPic;
          generate_contact();
          updateRead("read",contactName);
          flushChatCircle();
          updateScrollbar();
          //document.getElementById("record").innerHTML=JSON.parse(res).love;
      },
      error:function () {
        //console.log("failed")
      }
  })
  }
  else {
    document.getElementById('mCSB_1_container').innerHTML=" ";
    msg = $("<div>").addClass("message");
    msg.text("此为聊天窗口，右上角气泡按钮可展开通讯录。此为系统消息，回复无效。");
    msg.appendTo($('.mCSB_container'));
  }
  $("#phone_window").fadeIn(300);
  $(".overlay_whole").addClass("is-on");
});

$("#phone_icon").click(function () {
  $("#phone_window").fadeOut(300); 
  $(".phone_chat").fadeOut(300);
  $(".overlay_whole").removeClass("is-on");
  //console.log("chat_repo[chat_repo.length-1][contactName]")
  //console.log(chat_repo[chat_repo.length-1][contactName])
  //只有有名字才推送
  if (contactName){
    chat_repo[chat_repo.length-1][contactName]=chatLog.join("@"); //最近一层的记录更新
    $.ajax({
      url: '/moment/chat_log/',
      type: 'post',
      data: {contactName:contactName,chatLog:chatLog.join("@")},
      async:false,
      csrfmiddlewaretoken:'{{ csrf_token }}',
      success: function (res) {
          //document.getElementById("record").innerHTML=JSON.parse(res).love;
      },
      error:function () {
      }
  })
  }
});

$('.phone_chat').draggable({ handle: 'header' });
$('.drag_phone_window').draggable({cancel:".title",handle: 'header'});

$("#chat_window_icon").click(function () {
    generate_contact();
    flushChatCircle();
    $(".phone_chat").toggle();
});

$("#chat_window_cross").click(function () {
    $(".phone_chat").fadeOut(300);
});

function flushChatCircle(){
  $.ajax({
    url: '/moment/chat_log/',
    type: 'post',
    data: {msg:"flush_circle"},
    async:false,
    csrfmiddlewaretoken:'{{ csrf_token }}',
    success: function (res) {
        response=JSON.parse(res);
        _amount=parseInt(response["amount"]);
        _mark=1;
        for (i=0;i<_amount;i++){
          _name=response["unread_name"+i];
          if(response["update_state"+i]==0){
            _mark=0;
            document.getElementById("unread"+_name).innerHTML="【未读】";
          }
          else document.getElementById("unread"+_name).innerHTML="";
        }
        if(_mark==0)document.getElementById("chat_log_hint_circle").style.background="red";
        else document.getElementById("chat_log_hint_circle").style.background="green";
    },
    error:function () {
    }
  })
}

function generate_contact(){
  //提取namelist从后端
  contact_full_name_repo=new Array();
  contact_name_repo=new Array();
  $.ajax({
    url: '/moment/chat_log/',
    type: 'post',
    data: {msg:"list"},
    async:false,
    csrfmiddlewaretoken:'{{ csrf_token }}',
    success: function (res) {
        response=JSON.parse(res);
        _amount=response.contact_amount;
        if (_amount==0 && initialGenMark==1){
          document.getElementById("hint_title").innerHTML="【通讯录提示】";
          document.getElementById("hint_content").innerHTML="您暂未遇到任何角色，好友联系方式暂未激活。请继续游戏解锁【通讯录】功能。";
          $("#hint_window_whole").toggle();
        }else{
            contact_name_list=document.getElementById("contact_name_list");
            contact_name_list.innerHTML="";
            for (i=0;i<_amount;i++){
              //console.log("list床过来的名字有："+response["contact_name"+i])
              _li=document.createElement("li");
              _a=document.createElement("a");
              _a.className="thumbnail";
              _a.id="thumbnail"+i;
              _a.innerHTML=response["contact_name"+i][0];
              _div=document.createElement("div");
              _div.className="content";
              _h3=document.createElement("h3");
              _h3.id="contact_name_is"+i;
              contact_name_repo.push(response["contact_cue_name"+i]);
              contact_full_name_repo.push(response["contact_name"+i]);
              _h3.innerHTML=response["contact_name"+i];
              _spanname=document.createElement("span");
              _spanname.id="unread"+response["contact_cue_name"+i];
              _spanname.innerHTML="";
              _spanname.style.color="#E65540";
              _h3.appendChild(_spanname);
              _span1=document.createElement("span");
              _span1.className="preview";
              _span1.innerHTML=response["contact_illustration"+i];
              _span2=document.createElement("span");
              _span2.className="meta";
              _a2=document.createElement("a");
              _a2.innerHTML=response["contact_position"+i];
              _span2.appendChild(_a2);
              _div.appendChild(_h3);
              _div.appendChild(_span1);
              _div.appendChild(_span2);
              _li.appendChild(_a);
              _li.appendChild(_div);
              contact_name_list.appendChild(_li);

              document.getElementById("thumbnail"+i).onclick=function(arg){
                return function(){
                  _index=arg;
                //上一个人的记录先push
                //js update
                chat_repo[chat_repo.length-1][contactName]=chatLog.join("@"); //最近一层的记录更新
                //console.log("换通讯录里的人以后的chatrepo")
                //console.log(chat_repo)
                //后端 update 但是只有cntactname被赋值，才有需要update的people
                if(contactName){
                    $.ajax({
                      url: '/moment/chat_log/',
                      type: 'post',
                      data: {contactName:contactName,chatLog:chatLog.join("@")},
                      async:false,
                      csrfmiddlewaretoken:'{{ csrf_token }}',
                      success: function (res) {
                          response=JSON.parse(res);
                          //document.getElementById("record").innerHTML=JSON.parse(res).love;
                      },
                      error:function () {
                      }
                  })
                }
                document.getElementById('mCSB_1_container').innerHTML=" ";
                document.getElementById("contact_name").innerHTML=contact_full_name_repo[_index];
                contactName=contact_name_repo[_index];
                $.ajax({
                  url: '/moment/chat_log/',
                  type: 'post',
                  data: {contactName:contact_name_repo[_index]},
                  async:false,
                  csrfmiddlewaretoken:'{{ csrf_token }}',
                  success: function (res) {
                      updateRead("read",contact_name_repo[_index]);
                      response=JSON.parse(res);
                      chatContent=response.chat_log;
                      chatLog=chatContent.split("@");
                      for(j=0;j<chatLog.length;j++){
                        if(chatLog[j][0]=="o"){
                          msg = $("<div>").addClass("message");
                          msg.text(chatLog[j].slice(1));
                          msg.appendTo($('.mCSB_container'));
                          updateScrollbar();
                        }
                        if(chatLog[j][0]=="u"){
                          msg = $("<div>").addClass("message");
                          msg.text(chatLog[j].slice(1));
                          msg.addClass("personal").appendTo($('.mCSB_container'));
                          updateScrollbar();
                        }
                      }
                      chatPic=response.chat_pic;
                      document.getElementById("profile_avatar").src=chatPic; //可
                      //document.getElementById("record").innerHTML=JSON.parse(res).love;
                  },
                  error:function () {
                    //console.log("failed")
                  }
              })
              
                }
              }(i) 
            }
      }
    },
    error:function () {
    }
})
initialGenMark=1;

}
function updateRead(status,name){
  $.ajax({
    url: '/moment/chat_log/',
    type: 'post',
    data: {contactName:name,msg:status},
    async:false,
    csrfmiddlewaretoken:'{{ csrf_token }}',
    success: function (res) {   
        response=JSON.parse(res);
    },
    error:function () {
    }
  })
  generate_contact();
  flushChatCircle();
}
/* $.ajax({
    url: '/moment/chat_log/',
    type: 'post',
    data: {contactName:contactName},
    async:false,
    csrfmiddlewaretoken:'{{ csrf_token }}',
    success: function (res) {
        
        response=JSON.parse(res);
        chatContent=response.chat_log;
        chatLog=chatContent.split("@");
        chatPic=response.chat_pic;
        document.getElementById("profile_avatar").src=chatPic;
        document.getElementById("contact_name")=response.chat_full_name;
        //console.log("这是初始的generate吗？")
        //console.log(chatLog)
        //document.getElementById("record").innerHTML=JSON.parse(res).love;
    },
    error:function () {
    }
})
 */

        //按钮click



  //(function () {
    // JS practice.
    // Reference：https://codepen.io/supah/pen/jqOBqp
    // It's Cool ! ↑

    //提取聊天记录

    window.userTypingClear = function () {
      return uctTimer = setTimeout(function () {
        $(".message.personal.typing").remove();
        return isTyping = true;
      }, 1000);
    };
  
    window.setDate = function () {
      var d, timestamp;
      timestamp = $("<div>").addClass("timestamp");
      d = new Date();
      timestamp.text(d.getHours() + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes());
      return timestamp.appendTo($('.message:last'));
    };
  
    window.updateScrollbar = function () {
      return messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0 });
  
    };
    //contact_fakeMsg.push("hellawd"); //["Hi there, I\'m Kelly and you?"]; //!!!!!!

    window.setFakeMessage = function () {
      //可以预先设置消息
      var typing;
      typing = $("<div>").append("<span>").addClass("message typing");
      typing.appendTo($('.mCSB_container'));
      updateScrollbar();
      return setTimeout(function () {
        var msg;
        typing.remove();
        msg = $("<div>").addClass("message");
        msg.text(contact_fakeMsg[fakeNum]);
        msg.appendTo($('.mCSB_container'));
        setDate();
        updateScrollbar();
        chatLog.push("o"+contact_fakeMsg[fakeNum]);
        return fakeNum++;
      }, 1000 + Math.random() * 10 * 100);
    };
  
    window.insertMessage = function () {
      var msg, msgText;
      msgText = $(".action-box-input").val();
      if ($.trim(msgText) === "") {
        return false;
      }
      this.console.log(msgText)
      msg = $("<div>").addClass("message");
      msg.text(msgText);
      msg.addClass("personal").appendTo($('.mCSB_container'));
      setDate();
      updateScrollbar();
      chatLog.push("u"+msgText);
      $(".action-box-input").val(null);
      $(".message.personal.typing").remove();
      isTyping = true;
      clearTimeout(uctTimer);
      if ($.trim(contact_fakeMsg[fakeNum]) === "") {
        return false;
      }
      return setTimeout(function () {
        return setFakeMessage();
      }, 500 + Math.random() * 10 * 100);
    };
  
    $(window).on('keydown', function (e) {
      if (e.which === 13) {
        insertMessage();
        return false;
      }
    });
  
    $(window).load(function () {
      //聊天记录可在此处设置
    messages.mCustomScrollbar();
    for(i=0;i<chatLog.length;i++){
      if(chatLog[i][0]=="o"){
        msg = $("<div>").addClass("message");
        msg.text(chatLog[i].slice(1));
        msg.appendTo($('.mCSB_container'));
        updateScrollbar();
      }
      if(chatLog[i][0]=="u"){
        msg = $("<div>").addClass("message");
        msg.text(chatLog[i].slice(1));
        msg.addClass("personal").appendTo($('.mCSB_container'));
        updateScrollbar();
      }
    }
    });
  
    $(".action-box-input").on("keydown", function (e) {
      var typing;
      if ($(".action-box-input") !== "" && isTyping === true && e.which !== 13) {
        typing = $("<div>").append("<span>").addClass("message personal typing");
        typing.appendTo($('.mCSB_container'));
        updateScrollbar();
        isTyping = false;
        return userTypingClear();
      }
    });
  
  //}).call(this);





  
  //# sourceURL=coffeescript