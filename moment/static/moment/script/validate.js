function checkVal(elid,casenum){
    var valueEl=document.getElementById(elid).value;
    //pwd  Characters which contain at least one numeric digit and a special character(!@#$%^&*). Length not exceeding 150.
    var pswd=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{1,150}$/;
    var usn= /^[a-zA-Z0-9]{1,20}$/;
    var ema= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    //normal check
    //pwd
    checkMark=1;
    if(casenum==1){
        //console.log("1");
        if (elid=="sign_in_password"){
            if(!valueEl.match(pswd)){
                console.log("psw");
                document.getElementById("login_hint").innerHTML="Unvalid username or password.";
                return 0;
            }
        }
        if(!valueEl.match(pswd)){
            //document.getElementById("sign_up_password_error").innerHTML="Unvalid password! Characters which contain at least one numeric digit and a special character. Length not exceeding 150.";
            document.getElementById("sign_up_password_error").style.color="#E65540";
            checkMark=0;
        }
    }
    else if(casenum==2) //username
    {
        //console.log("2");
        if (elid=="sign_in_username"){
            if(!valueEl.match(usn)){
                console.log("usn");
                document.getElementById("login_hint").innerHTML="Unvalid username or password."
                return 0;
            }    
        }
        if(!valueEl.match(usn)){
            document.getElementById("sign_up_username_error").innerHTML="Unvalid username! Only contains characters or digits. Length not exceeding 20.";
            document.getElementById("sign_up_username_error").style.color="#E65540";
            checkMark=0;
        }
    }
    else if(casenum==3){
        console.log("3");
        //email
        if(!valueEl.match(ema)){
            document.getElementById("sign_up_email_error").innerHTML="Unvalid email.";
            document.getElementById("sign_up_email_error").style.color="#E65540";
            checkMark=0;
        }
    }
    return checkMark;
}

//click
document.getElementById("login_btn").onclick=function(){
    var userna=document.getElementById("sign_in_username").value;
    var passwo=document.getElementById("sign_in_password").value;
    if(checkVal("sign_in_username",2) && checkVal("sign_in_password",1)){
        $.ajax({
            url: '/moment/verify/',
            type: 'post',
            data:{username:userna,password:passwo},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                if (response["msg"]=="invalid"){
                  document.getElementById("login_hint").innerHTML="Unvalid username or password!";
                }
                if(response["msg"]=="ok")window.location.href="../galcate/";
                
                //console.log("现在的id时："+archiveID);
            },
            error:function () {
                //console.log("faillllllll：");
            }
        })
    }
}

document.getElementById("signup_btn").onclick=function(){
    var username=document.getElementById("sign_up_username").value;
    var password=document.getElementById("sign_up_password").value;
    var email=document.getElementById("sign_up_email").value;
    var invite_code=document.getElementById("invite_code").value;
    document.getElementById("sign_up_email_error").style.color="gray";
    document.getElementById("sign_up_password_error").style.color="gray";
    document.getElementById("sign_up_username_error").style.color="gray";
    document.getElementById("sign_up_email").innerHTML="We will protect your privacy."
    checkVal("sign_up_username",2);
    checkVal("sign_up_email",3);
    checkVal("sign_up_password",1);
    if(checkVal("sign_up_username",2) && checkVal("sign_up_email",3) && checkVal("sign_up_password",1)){
        $.ajax({
            url: '/moment/register/',
            type: 'post',
            data:{username:username,password:password,email:email,invite_code:invite_code,},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                if (response["msg"]=="existed"){
                  document.getElementById("sign_up_username_error").innerHTML="The username is used。";
                  document.getElementById("sign_up_username_error").style.color="#E65540";
                }
                if(response["msg"]=="invalid")document.getElementById("invite_code_hint").innerHTML="Wrong Invite Code. Please ask the game developer for invite code.";
                if(response["msg"]=="ok")window.location.href="../galcate/";
                
            },
            error:function () {
                //console.log("faillllllll：");
            }
        })
    }

}

//slide effect
document.querySelector('.img__btn').addEventListener('click', function() {
    document.querySelector('.cont').classList.toggle('s--signup');
});