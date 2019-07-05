document.querySelector('.img__btn').addEventListener('click', function() {
    document.querySelector('.cont').classList.toggle('s--signup');
  });

Vue.use(VeeValidate);

signIn=new Vue({
    el: '#sign_in_div',
    delimiters: ['[[', ']]'],
    data:{
      
    },
    methods: {
    onSignIn () {
      
      this.$validator.validate("sign_in.username_in").then(valid => {
        if (!valid) {
          //console.log("!!!");
          document.getElementById("sign_in_username_error").innerHTML="输入用户名含非法字符，请检查";
          // do stuff if not valid.
        }
        else document.getElementById("sign_in_username_error").innerHTML="";
      
      this.$validator.validate("sign_in.password_in").then(valid => {
          if (!valid) {
            //console.log("##");
            document.getElementById("sign_in_username_error").innerHTML="输入密码含非法字符，请检查";
          }
          else document.getElementById("sign_in_username_error").innerHTML="";
      })

      this.$validator.validateAll("sign_in").then(valid => {

        if (valid) {
          username=$("#sign_in_username").val();
          password=$("#sign_in_password").val();
          $.ajax({
            url: '/moment/verify/',
            type: 'post',
            data:{username:username,password:password},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                if (response["msg"]=="invalid"){
                  document.getElementById("login_hint").innerHTML="用户名或密码错误";
                }
                if(response["msg"]=="ok")window.location.href="../galcate/";
                
                //console.log("现在的id时："+archiveID);
            },
            error:function () {
                //console.log("faillllllll：");
            }
        })
        }
    })

  })},

    }
})



signUp=new Vue({
  el: '#sign_up_div',
  delimiters: ['[[', ']]'],
  data:{
  },
  methods: {
  onSignUp () {
    this.$validator.validate("sign_up.username_up").then(valid => {
    if (!valid) {
      markFinal=0;
      document.getElementById("sign_up_username_error").innerHTML="用户名只能包含大小写字母，数字，下划线。请重新输入。";
      document.getElementById("sign_up_username_error").style.color="#E65540";
      // do stuff if not valid.
    }
    else{
      document.getElementById("sign_up_username_error").innerHTML="用户名合法（但现在不确定是否和数据库冲突orz）";
      document.getElementById("sign_up_username_error").style.color="gray";
    }
  
  this.$validator.validate("sign_up.password_up").then(valid => {
      if (!valid) {
        markFinal=0;
        document.getElementById("sign_up_password_error").innerHTML="密码只能包含大小写字母，数字，下划线。请重新输入。";
        document.getElementById("sign_up_password_error").style.color="#E65540";
      }
      else{
        document.getElementById("sign_up_password_error").innerHTML="密码合法";
        document.getElementById("sign_up_password_error").style.color="gray";
      }
  })
  this.$validator.validate("sign_up.email_up").then(valid => {
    if (!valid) {
      markFinal=0;
      //console.log("email invalid")
      document.getElementById("sign_up_email_error").innerHTML="邮箱格式不合法";
      document.getElementById("sign_up_email_error").style.color="#E65540";
    }
    else{
      document.getElementById("sign_up_email_error").innerHTML="邮箱合法";
      document.getElementById("sign_up_email_error").style.color="gray";
    }
})
    
this.$validator.validateAll("sign_up").then(valid => {
    if (valid) {
      username=$("#sign_up_username").val();
      password=$("#sign_up_password").val();
      email=$("#sign_up_email").val();
      invite_code=$("#invite_code").val();
      //console.log("invite:"+invite_code)
      $.ajax({
        url: '/moment/register/',
        type: 'post',
        data:{username:username,password:password,email:email,invite_code:invite_code,},
        async:false,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            response=JSON.parse(res);
            if (response["msg"]=="existed"){
              document.getElementById("sign_up_username_error").innerHTML="该用户名已被注册。";
              document.getElementById("sign_up_username_error").style.color="#E65540";
            }
            if(response["msg"]=="invalid")document.getElementById("invite_code_hint").innerHTML="邀请码错误，您没有权限参与游戏";
            if(response["msg"]=="ok")window.location.href="../galcate/";
            
            
            //console.log("现在的id时："+archiveID);
        },
        error:function () {
            //console.log("faillllllll：");
        }
    })
    }
    else{//console.log("invalid");
  }
})
    })

}


}
})




