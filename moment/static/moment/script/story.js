//禁用右键
document.oncontextmenu = function () { return false; };
//禁用选中
document.onselectstart = function () { return false; };
//$.ajaxSetup({async:false});
//https://blog.csdn.net/qq_39640877/article/details/80566584
$.ajaxSetup({
    cache:false, 
    async:false,});
var Human_repo={}; //人的集合
//auto
var autoMode=false;
var autoInt;//set interval
var beforeFilmAutoMode=false;
//auto interval value
var nonFigInterval=500;
var characterInterval=50;
var sentenceInterval=1000;

const  rootPath="/static/moment/";
var dir={
    recordDir: rootPath+ "record/",
    storyDir: " ",
    picDir: rootPath+ "image/pic/",
    soundDir: rootPath+ "sound/",
    figDirLeft: rootPath+ "image/figure/",
    figDirRight: rootPath+ "image/figure/",
    figDirCenter: rootPath+ "image/figure/",
};  
            
var __currentArchiveId; //现在的存档标号
var enterStoryMark=0; //最初进入故事
var specialSaveSenMark=0; //如果存档的时候刚好是record或者按钮相关，把它变成1，然后下次load specialSaveSenNum
var repoStatus;
var specialSaveSenNum;
var curWordsRepo;
var curWorsContent;
const setupLine=3; //前3行初始化
var curSenNum=0;
var initialStoryMark=0;
var effectMark=2;  //stpe effect
var aeFunc; //time reserve ID
var buttonContent;
var buttonFile;
var Record=new Array(); //记录
var name_repo=[];
var GT_repo=new Array(); //Gift and Trip集合
var NC_repo=new Array(); //namecard 集合
//关于cCtag中多行语句自动部分变量
var continueInt; //cCtag中多行语句自动
var continueMark=0;
var _curSenNum;
var newPersonRepo={};
    //人物初始设定 变量+加入repo 
/*     _HGG=new Person("hgg",60,50,100);
    _PP=new Person("pp",100,50,0);
    Human_repo["hgg"]=_HGG;
    Human_repo["pp"]=_PP; */

    //autosave
    if(enterStoryMark)autoSave=setInterval(saveArch(),300000); //每三分钟save一次
    //setting
    function getBasicSetiing(){
        $.ajax({
            url: '/moment/basic_setting/',
            type: 'post',
            data:{},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                characterInterval=parseInt(response["character_interval"]);
                sentenceInterval=parseInt(response["paragraph_interval"]);
                $("#character_interval").val(characterInterval).change();
                $("#sentence_interval").val(sentenceInterval).change();
                document.getElementById("setting_confirm").onclick=(function(){
                    chaVal = parseInt($("#character_interval").val());
                    senVal = parseInt($("#sentence_interval").val());
                    if (chaVal>0 && senVal>0){
                        $.ajax({
                            url: '/moment/basic_setting/',
                            type: 'post',
                            data:{character_interval:chaVal,paragraph_interval:senVal},
                            async:false,
                            csrfmiddlewaretoken:'{{ csrf_token }}',
                            success: function (res) {
                                $("#character_interval").val(chaVal).change();
                                $("#sentence_interval").val(senVal).change();
                                characterInterval=chaVal;
                                sentenceInterval=senVal;
                                document.getElementById("hint_title").innerHTML="【系统提示】";
                                document.getElementById("hint_content").innerHTML="更改成功！";
                                $("#hint_window_whole").toggle();
                            },
                            error:function () {
                                console.log("setting faillllllll：");
                            }
                        })
                    }
                    else{
                        document.getElementById("hint_title").innerHTML="【系统提示】";
                        document.getElementById("hint_content").innerHTML="您输入了非法数值，请输入大于0的数值。非整数字符将会自动转为整数值。";
                        $("#hint_window_whole").toggle();
                    }
                })

            },
            error:function () {
                console.log("setting faillllllll：");
            }
        })
    }
    getBasicSetiing();
    //flush小圈圈
    function flushHintCircle(){
        $.ajax({
            url: '/moment/story_navigation/',
            type: 'post',
            data: {},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response = JSON.parse(res);
                loveChange=parseInt(response.love_change);
                moneyChange=parseInt(response.money_change);
                healthChange=parseInt(response.health_change);
                if (loveChange==0 && healthChange==0 && moneyChange==0){
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
    }
     //图鉴 翻转
    var flipMark=0;
     document.getElementById("flip_icon").onclick=(function(){
        if(!flipMark){
        $('#flip_icon').transition({
            rotateY: '180deg'
          });
        }
        if(flipMark){
            $('#flip_icon').transition({
                rotateY: '0deg'
              });
        }
        flipMark=!flipMark;
        //document.getElementId("flip_back").style.transform=rotateY(180);
    })

    //人物 类
    function Person(name,health,love,money){
        this.name=name; //人名
        this.love=parseInt(love); //好感度
        this.health=parseInt(health); //健康
        this.money=parseInt(money);
        //一些函数
        this.AddLove=function(num){this.love+=num;}
        this.DelLove=function(num){this.love-=num;}
        this.AddHealth=function(num){this.health+=parseInt(num);}
        this.DelHealth=function(num){this.health-=num;}
        this.AddMoney=function(num){this.money+=num;}
        this.DelMoney=function(num){this.money-=num;}
    }
    //读取存档号
    $.ajax({
        url: '/moment/read_archive_id/',
        type: 'post',
        data:{suibiande:1},
        async:false,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            __currentArchiveId=parseInt(JSON.parse(res).archive_id);
            dir['recordDir']=dir['recordDir']+__currentArchiveId;
            //console.log("现在的id时："+__currentArchiveId);
        },
        error:function () {
            console.log("faillllllll：");
        }
    })
   
    //读人

    $.ajax({
        url: '/moment/pull_record/',
        type: 'post',
        data:{"require":"person_repo"},
        async:false,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            response=JSON.parse(res)
            _name_repo=response.name_repo.split("@");
            for(i=0;i<response.people_amount;i++){
                name=_name_repo[i];
                health=response[name+"_health"];
                love=response[name+"_love"];
                money=response[name+"_money"];
                createNewPerson(name,health,love,money);
            }
        },
        error:function () {
            console.log("faillllllll：");
        }
    })
    function createNewPerson(name,health,love,money){
        //只有不存在才建立
        if (!(name in Human_repo)){
            person=new Person(name,health,love,money);
            Human_repo[person.name]=person;
            name_repo.push(name);
        }
    }
    function deleteNewPerson(name){
        _index = name_repo.indexOf(name);
        if(_index>-1){
            name_repo.splice(_index, 1);
        }
        delete Human_repo[name];
        $.ajax({
            url: '/moment/delete_person/',
            type: 'post',
            data:{"name":name},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
    }

    //记录
    function recordRecord(){
        if (specialSaveSenMark==0)currentSentenceNumberValue=curSenNum-1;//因为每次点击出来都会+1
        else currentSentenceNumberValue=specialSaveSenNum;
        newRecord={
            /* "hggLove": _HGG.love,
            "hggMoney": _HGG.money,
            "hggHealth": _HGG.health,
            "ppLove": _PP.love,
            "ppMoney": _PP.money,
            "ppHealth": _PP.health,  */
            "activeState":1,
            "currentArchiveId":__currentArchiveId,
            "currentSentenceNumber":currentSentenceNumberValue,
            "recordDir":dir["storyDir"],
            "last_figure_left_url":dir["figDirLeft"],
            "last_figure_right_url":dir["figDirRight"],
            "last_figure_center_url":dir["figDirCenter"],
            "last_pic_url":dir["picDir"],
            "last_sound_url":dir["soundDir"],
            "last_sentence":curWorsContent,
        }

        for (i=0;i<Object.keys(Human_repo).length;i++){
            _name=name_repo[i];
            newRecord[_name+"Love"]=Human_repo[_name].love;
            newRecord[_name+"Health"]=Human_repo[_name].health;
            newRecord[_name+"Money"]=Human_repo[_name].money;
        }
        Record.push(newRecord);
    }
    //记录弹出，回到上一级文件
    function popRecord(){
        document.getElementById('mCSB_1_container').innerHTML=" ";
        document.getElementById("contact_name").innerHTML="【系统消息】";
        msg = $("<div>").addClass("message");
        msg.text("此为聊天窗口，右上角气泡按钮可展开通讯录。此为系统消息，回复无效。");
        msg.appendTo($('.mCSB_container'));
        document.getElementById("profile_avatar").src="/static/moment/image/setting_dir/profile_phote.jpg";//默认avatar
        contactName="";
        function __pop(){
            var tempRecord;
            tempRecord=Record.pop();
            if (specialSaveSenMark==0)currentSentenceNumberValue=curSenNum-1;//因为每次点击出来都会+1
            else currentSentenceNumberValue=specialSaveSenNum;
            date=new Date()
            dateString=date.getFullYear().toString()+"年"+date.getMonth().toString()+"月"+date.getDate().toString()+"日 "+date.getHours().toString()+":"+date.getMinutes().toString();
            post_data={ activeState:1,
                currentArchiveId:tempRecord["currentArchiveId"],
                currentSentenceNumber:tempRecord["currentSentenceNumber"] ,
                recordDir:tempRecord["recordDir"],
                lastSentence:tempRecord["last_sentence"],
                lastFigureLeft:tempRecord["last_figure_left_url"],
                lastFigureRight:tempRecord["last_figure_right_url"],
                lastFigureCenter:tempRecord["last_figure_center_url"],
                lastPic:tempRecord["last_pic_url"],
                lastSound:tempRecord["last_sound_url"],
                date:dateString,        
            };
            for (i=0;i<Object.keys(Human_repo).length;i++){
                _name=name_repo[i];
                post_data[_name+"Love"]=tempRecord[_name+"Love"];
                post_data[_name+"Health"]=tempRecord[_name+"Health"];
                post_data[_name+"Money"]=tempRecord[_name+"Money"];
            }
            for (i=0;i<Object.keys(Human_repo).length;i++){
                _name=name_repo[i];
                Human_repo[_name].love=tempRecord[_name+"Love"];
                Human_repo[_name].health=tempRecord[_name+"Health"];
                Human_repo[_name].money=tempRecord[_name+"Money"];
            }  
            $.ajax({
                url: '/moment/savearchive/',
                type: 'post',
                data: post_data,
                async:false,
                csrfmiddlewaretoken:'{{ csrf_token }}',
                success: function (res) {
                    //document.getElementById("record").innerHTML=JSON.parse(res).love;
                },
                error:function () {
                }
            })
            //把change清掉
            $.ajax({
                url: '/moment/story_navigation/',
                type: 'post',
                data: {'health_change':0,'love_change':0,'money_change':0},
                async:false,
                csrfmiddlewaretoken:'{{ csrf_token }}',
                success: function (res) {
                }
            })
            //GT namecard 操作
            _GT_record=GT_repo.pop();
            inactive_GT(_GT_record);
            _NC_record=NC_repo.pop();
            inactive_NC(_NC_record);
            //chat log 操作
            chat_repo.pop()
            _chat_log=chat_repo[chat_repo.length-1]; //有各种名字的一级{"XF":["WA","QWDQ"],"TY":["dw",["das"]}
            //将chat_window数据库更新
            for (var key in _chat_log){
                if (key=="~~")delete _chat_log[key]; //initial 每个文件的记录时候push的
                else {
                    _chat_content=_chat_log[key];
                    $.ajax({
                        url: '/moment/chat_log/',
                        type: 'post',
                        data: {contactName:key,chatLog:_chat_content},
                        async:false,
                        csrfmiddlewaretoken:'{{ csrf_token }}',
                        success: function (res) {
                            response=JSON.parse(res);
                            //console.log(response)
                            //document.getElementById("record").innerHTML=JSON.parse(res).love;
                        },
                        error:function () {
                        }
                    })
                }
            }
            initialRecordStory(); 
        }
        if (repoStatus=="a"){
            if (Record.length>1){ //如果目前已经是button，而且是可以返回的状态 那么要pop两次；
                Record.pop();
                if (newPersonRepo[""+Record.length]){
                    _nameRepo=newPersonRepo[""+Record.length].split("@");
                    for(i=0;i<_nameRepo.length;i++){
                        deleteNewPerson(_nameRepo[i]);
                    }
                    delete newPersonRepo[""+Record.length];
                }
                __pop();
            }
            if (Record.length<=1)document.getElementById("buttonBack").innerHTML="人生无悔";
        }
        else {
            if (newPersonRepo[""+Record.length]){
                _nameRepo=newPersonRepo[""+Record.length].split("@");
                for(i=0;i<_nameRepo.length;i++){
                    deleteNewPerson(_nameRepo[i]);
                }
                delete newPersonRepo[""+Record.length];
            }
            __pop();
        } //常规状态时候的pop 
    }

    //对象属性改变
    function property_change(){
        var human_name;
        _recordLine=parseInt(strip(curWordsRepo[curSenNum].slice(1)));
        _endcursenNum=curSenNum+_recordLine+1;
        curSenNum++;
        var postData={"health_change":0,'love_change':0,'money_change':0,};
        for(var rindex=0;rindex<_recordLine;rindex++){
            switch(curWordsRepo[curSenNum][0]){
                case "*":
                    human_name=curWordsRepo[curSenNum].slice(1);
                    human_name=human_name.replace(/\s+/g,""); //去空格
                    if (curWordsRepo[curSenNum][1]!="e")postData["name"]=human_name;
                    if (curWordsRepo[curSenNum][1]=="e"){
                        //savearchieve需要的数据
                        postData["activeState"]=1;
                        postData["currentArchiveId"]=__currentArchiveId;
                        postData["currentSentenceNumber"]=_endcursenNum; //要计算一下
                        postData["recordDir"]=dir["storyDir"];
                        postData['lastSentence']=curWorsContent;
                        postData["lastFigureLeft"]=dir["figDirLeft"];
                        postData["lastFigureRight"]=dir["figDirRight"];
                        postData["lastFigureCenter"]=dir["figDirCenter"];
                        postData["lastPic"]=dir["picDir"];
                        postData["lastSound"]=dir["soundDir"];
                        for (i=0;i<Object.keys(Human_repo).length;i++){
                            _name=name_repo[i];
                            postData[_name+"Love"]=Human_repo[_name].love;
                            postData[_name+"Health"]=Human_repo[_name].health;
                            postData[_name+"Money"]=Human_repo[_name].money;
                        }
                        //update特殊数据
/*                         postData["current_health"]=Human_repo[human_name].health;
                        postData["current_money"]=Human_repo[human_name].money;
                        postData["current_love"]=Human_repo[human_name].love; */
                        date=new Date()
                        dateString=date.getFullYear().toString()+"年"+date.getMonth().toString()+"月"+date.getDate().toString()+"日 "+date.getHours().toString()+":"+date.getMinutes().toString();
                        postData["date"]=dateString;
                        //存到数据
                        $.ajax({
                            url: '/moment/savearchive/',
                            type: 'post',
                            data: postData,
                            async:false,
                            csrfmiddlewaretoken:'{{ csrf_token }}',
                            success: function (res) {
                                //change归零
                                //document.getElementById("record").innerHTML=JSON.parse(res).love;
                            },
                            error:function () {
                            }
                        })
                        postData['health_change']=0;
                        postData['love_change']=0;
                        postData['money_change']=0;
                    }
                    curSenNum++;
                    
                    break;
                
                case "h":
                    if(curWordsRepo[curSenNum][1]=="+"){
                        addvalue=parseInt(curWordsRepo[curSenNum].slice(2));
                        Human_repo[human_name].AddHealth(addvalue);
                        postData["health_change"]= postData["health_change"]+addvalue;
                    }
                    else {
                        delvalue=parseInt(curWordsRepo[curSenNum].slice(2));
                        Human_repo[human_name].DelHealth(delvalue);
                        postData["health_change"]=postData["health_change"]-delvalue;
                    }
                    curSenNum++;
                    break;
                
                case "m":
                    if(curWordsRepo[curSenNum][1]=="+"){
                        addvalue=parseInt(curWordsRepo[curSenNum].slice(2));
                        Human_repo[human_name].AddMoney(addvalue);
                        postData["money_change"]= postData["money_change"]+addvalue;
                        //Human_repo[human_name].AddMoney(parseInt(curWordsRepo[curSenNum].slice(2)));
                    }
                    else {
                        delvalue=parseInt(curWordsRepo[curSenNum].slice(2));
                        Human_repo[human_name].DelMoney(delvalue);
                        postData["money_change"]=postData["money_change"]-delvalue;
                    }
                    curSenNum++;
                    break;
                   
                case "l":
                    if(curWordsRepo[curSenNum][1]=="+"){
                        //Human_repo[human_name].AddLove(parseInt(curWordsRepo[curSenNum].slice(2)));
                        addvalue=parseInt(curWordsRepo[curSenNum].slice(2));
                        Human_repo[human_name].AddLove(addvalue);
                        postData["love_change"]= postData["love_change"]+addvalue;
                    }
                    else {
                        //Human_repo[human_name].DelLove(parseInt(curWordsRepo[curSenNum].slice(2)));
                        delvalue=parseInt(curWordsRepo[curSenNum].slice(2));
                        Human_repo[human_name].DelLove(delvalue);
                        postData["love_change"]=postData["love_change"]-delvalue;
                    }
                    curSenNum++;
                    break;
            }
        }
        flushHintCircle();

    }

    function loadFile() {
        //loadRecord(); //把信息记录一下
        initialStoryMark=0;
        curSenNum=0;
        document.getElementById("button_list").innerHTML=" ";
        document.getElementById("button_list_all").style.display="none";
        $.get(dir["storyDir"], function (content) {
            curWordsRepo = content.split("\n");
        });
    }

    //初始化有存档的story
    function initialRecordStory(){
        document.getElementById("story_words").innerHTML=" ";
        document.getElementById("film_content").innerHTML=" ";
        if (Record.length>=1)document.getElementById("buttonBack").innerHTML="人生重来一次";
        if (Record.length<1){
            document.getElementById("buttonBack").innerHTML="人生无悔";
        }
        if (GT_repo.length<1)GT_repo.push("GT"); //back按钮回退的不要加新的GT记录
        if (NC_repo.length<1)NC_repo.push("NC"); //back按钮回退的不要加新的NC记录
        if (chat_repo.length<1){
            chat_repo.push({"~~":""});
            initChatLog();
        }; //back按钮回退的不要加新的chat_log记录
        $.ajax({
            url: '/moment/pull_record/',
            type: 'post',
            data:{current_archive_id:__currentArchiveId},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                curSenNum=response.current_sentence_number;
                dir["storyDir"]=response.story_dir;
                dir["picDir"]=response.last_pic_url;
                dir["figDirLeft"]=response.last_figure_left_url;
                dir["figDirRight"]=response.last_figure_right_url;
                dir["figDirCenter"]=response.last_figure_center_url;
                dir["soundDir"]=response.last_sound_url;
                curWorsContent=response.last_sentence;
                for (i=0;i<Object.keys(Human_repo).length;i++){
                    _name=name_repo[i];
                    Human_repo[_name].love=response[_name+"_love"];
                    Human_repo[_name].health=response[_name+"_health"];
                    Human_repo[_name].money=response[_name+"_money"];
                }
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
        $.get(dir["storyDir"], function (content) {
            curWordsRepo = content.split("\n");
        });
        document.getElementById("button_list").innerHTML=" ";
        document.getElementById("button_list_all").style.display="none";
        
        /* if (curSenNum<3){
            curSenNum=0;
            initialSetup();
        }
        else { */
/*             _storeCurSenNum=curSenNum;
            curSenNum=0; */
            picpath=dir["picDir"];
            document.getElementById("body_back").style.backgroundImage="url("+picpath+")";
            document.getElementById("story_figure_left").src=dir["figDirLeft"];
            document.getElementById("story_figure_right").src=dir["figDirRight"];
            document.getElementById("story_figure_center").src=dir["figDirCenter"];
        if(curWordsRepo[curSenNum][0]!="v"){
            initialSpeak();
        }
        //放音乐
        if(enterStoryMark==0){
            document.getElementById("backMusicAudio").pause();
            document.getElementById("backMusic").setAttribute('src', dir["soundDir"]);
            document.getElementById("backMusicAudio").load();
            document.getElementById("backMusicAudio").play();
        }
        enterStoryMark=1;
        initialStoryMark=1;
    }

    function initialSpeak(){
        effectMark--;
        if(effectMark<=0){
            clearInterval(aeFunc);
            document.getElementById("story_words").innerHTML=curWorsContent;
            effectMark=2;
        }
       
        if(effectMark==1){
            document.getElementById("story_words").innerHTML=" ";
            affterEffect(curWorsContent,"story_words");
        } 
    }


    //初始化一般的情况
    function initialStory(){
        loadFile();
        //清空
        document.getElementById("story_words").innerHTML=" ";
        document.getElementById("film_content").innerHTML=" ";
        if (Record.length>=1)document.getElementById("buttonBack").innerHTML="人生重来一次";
        if (Record.length<1){
            document.getElementById("buttonBack").innerHTML="人生无悔";
        }
        GT_repo.push("GT");
        NC_repo.push("NC");
        chat_repo.push({"~~":""});
        initChatLog();
        initialStoryMark=1;
        if(autoMode){
            autoInt=setInterval(selectRepo,100);
        }
    }

    function jumpStory(num){
        curSenNum=num;
        document.getElementById("story_words").innerHTML=" ";
        document.getElementById("film_content").innerHTML=" ";
        if (Record.length>=1)document.getElementById("buttonBack").innerHTML="人生重来一次";
        if (Record.length<1){
            document.getElementById("buttonBack").innerHTML="人生无悔";
        }
        GT_repo.push("GT");
        NC_repo.push("NC");
        chat_repo.push({"~~":""});
        initChatLog();
        initialStoryMark=1;
        if(autoMode){
            autoInt=setInterval(selectRepo,100);
        }
    }
    function simpleJumpSen(num){
        curSenNum=num;
    }
    var tempAutoInt=false;
    function simpleJumpFile(file,num){
        dir["storyDir"]=file;
        //loadFile();
        if (autoMode){
            autoMode=false;
            beforeFilmAutoMode=false;
            document.getElementById("auto_icon").className="glyphicon glyphicon-play";
            clearInterval(autoInt); 
            document.getElementById("buttonBack").disabled=false;    
        }
        initialStory();
        simpleJumpSen(num);

    }

    //story文件前三行的setup
    function initialSetup(){
        for(;curSenNum<setupLine;curSenNum++){
            switch(curWordsRepo[curSenNum][0]){
                //background-pic
                case "b": 
                    dir["picDir"]=curWordsRepo[curSenNum].slice(1);
                    //document.getElementsByTagName("body").setAttribute("background",dir["picDir"]);
/*                     document.getElementById("body_back").style.backgroundImage = "url('" + dir["picDir"] + " ')";
                    document.getElementById("body_back").style.cssText="background-size:100% 100%; background-attachment: fixed;"; */
                    picpath=dir["picDir"].toString(); //change the element to string type
                    document.getElementById("body_back").style.backgroundImage="url("+picpath+")";
                    break;
        
                //sound
                case "s":
                    dir["soundDir"]=curWordsRepo[curSenNum].slice(1);
                    document.getElementById("backMusic").src=dir["soundDir"];
                    $("#backMusic").play();
                    break;

                //figure
                case "f":
                    _figUrl=curWordsRepo[curSenNum].slice(2);
                    if(_figUrl[0]=="n")_figUrl="";
                    switch(curWordsRepo[curSenNum][1]){
                        case "l":
                            dir["figDirLeft"]=_figUrl;
                            document.getElementById("story_figure_left").src=_figUrl;
                            break;
                        case "r":
                            dir["figDirRight"]=_figUrl;
                            document.getElementById("story_figure_right").src=_figUrl;
                            break;
                        case "c":
                            dir["figDirCenter"]=_figUrl;
                            document.getElementById("story_figure_center").src=_figUrl;
                            break;

                    }
                    break;

            }

        }
    }

    function buttonList(){
        buttonIndex++;
        var buttonSection=document.createElement("section"); 
        newButton=document.createElement("button");
        if (buttonFile[0]!="j"){
            newButton.id=buttonFile;
        }
        else {
            newButton.id=dir["storyDir"]+strip(buttonFile.slice(1));
            buttonJumpSenNum=parseInt(strip(buttonFile.slice(1)));
        }
        newButton.className="dashed thin";
        newButton.style.margin="0 auto"; 
        //newButton.setAttribute("data-title",buttonContent);
        newButton.innerHTML=buttonContent;
        newButton.style.fontSize="20px";
        buttonSection.appendChild(newButton);
        document.getElementById("button_list").appendChild(buttonSection);
        document.getElementById("button_list_all").style.display="block";
        //var br=document.createElement("div"); 
        //br.innerHTML="<br/>"; 
        //document.getElementById("button_list").appendChild(br);
        if (buttonFile[0]!="j"){
            document.getElementById(buttonFile).onclick= function(){      
                dir["storyDir"]=this.id;
                //loadFile();
                initialStory();
                selectRepo();
            }; 
        }else {
            document.getElementById(dir["storyDir"]+strip(buttonFile.slice(1))).onclick= function(arg){      
                return function(){
                    jumpStory(arg-1);
                    document.getElementById("button_list").innerHTML=" ";
                    document.getElementById("button_list_all").style.display="none";
                    selectRepo();
                }
            }(buttonJumpSenNum);
        }

    }
    
    function affterEffect(cwords,id) {
        var index=0;
        var words=cwords;
        curWorsContent=curWordsRepo[curSenNum].slice(1);
        function _affterEffect(){
            document.getElementById(id).innerHTML+=words[index++];
            if(index==words.length) {
                effectMark=2;
                curSenNum++;
                clearInterval(aeFunc);
            }
        }
        aeFunc=setInterval(_affterEffect,characterInterval);
    }

    function speakStory(idname,slice){
        _sen=curWordsRepo[curSenNum].slice(slice);
        effectMark--;
        if(effectMark<=0){
            clearInterval(aeFunc);
            document.getElementById(idname).innerHTML=_sen;
            curWorsContent=_sen;
            effectMark=2;
            curSenNum++;
            if (continueMark==1){
                clearInterval(continueInt);
                continueInt=setInterval(selectRepo,sentenceInterval);
            }
            if(autoMode){
                clearInterval(autoInt);
                autoInt=setInterval(selectRepo,sentenceInterval);
            }
        }
       
        if(effectMark==1){
            if (continueMark==1){
                clearInterval(continueInt);
                continueInt=setInterval(selectRepo,_sen.length*characterInterval+sentenceInterval);
            }
            if (autoMode==1){
                clearInterval(autoInt);
                autoInt=setInterval(selectRepo,_sen.length*characterInterval+sentenceInterval);
            }
            document.getElementById(idname).innerHTML=" ";
            affterEffect(_sen,idname);
        } 
    }

    function hintWord(){
        hint=document.createElement("div");
        hint.style.fontWeight="300";
        switch(curWordsRepo[curSenNum][1]){
            case "m":
                hint.innerHTML="[系统提示]  您收到了一条新消息。"+curWordsRepo[curSenNum].slice(2);
                hint.style.color="#005757";
                break;
            case "p":
                hint.innerHTML="[系统提示]  角色属性改变："+curWordsRepo[curSenNum].slice(2);
                hint.style.color="#E65540";
                break;
            case "t":
                hint.innerHTML="[系统提示]  获得新成就："+curWordsRepo[curSenNum].slice(2);
                hint.style.color="#484891";
                break;
        }
        document.getElementById("story_words").appendChild(hint);
        curSenNum++;
    }
    //init chat_log for record
    function initChatLog(){

        $.ajax({
            url: '/moment/chat_log/',
            type: 'post',
            data: {msg:"init"},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                if(response["chat_name"]){
                    _name_repo=response["chat_name"].split("@")
                    for (var i=0;i<_name_repo.length;i++){
                        _contact_name=_name_repo[i];
                        //求chat_log
                        $.ajax({
                            url: '/moment/chat_log/',
                            type: 'post',
                            data: {contactName:_contact_name},
                            async:false,
                            csrfmiddlewaretoken:'{{ csrf_token }}',
                            success: function (res) {
                                _response=JSON.parse(res);
                                chat_repo[chat_repo.length-1][_contact_name]=_response["chat_log"];
                            },
                            error: function(res){console.log("initchatLog failed")}
                        })
                    }
            }
            },
            error: function(res){console.log("initchatLog failed")}
        })
    }

    function archive_GT(){
        date=new Date()
        _repo=curWordsRepo[curSenNum].slice(1).split("#");
        GT_repo[Record.length]=GT_repo[Record.length]+"#"+_repo[1];
        $.ajax({
            url: '/moment/archive_GT_NC/',
            type: 'post',
            data: {
                year:date.getFullYear().toString(),
                month:date.getMonth().toString(),
                day:date.getDate().toString(),
                pic_url:_repo[0],
                subtitle:_repo[1],
                title:_repo[2],
                illustration:_repo[3],
                main_person:_repo[4],
                tag1:_repo[5],
                tag2:_repo[6],
                tag3:_repo[7],
            },
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
            }
        })

    }

    function inactive_GT(GT_record){
        $.ajax({
            url: '/moment/archive_GT_NC/',
            type: 'post',
            data: {
                archive_GT:GT_record,
            },
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
            }
        })
    }
    
    function archive_NC(){
        date=new Date()
        _repo=curWordsRepo[curSenNum].slice(1).split("#");
        NC_repo[Record.length]=NC_repo[Record.length]+"#"+_repo[0];
        //创建人物
        createNewPerson(_repo[0],parseInt(_repo[4]),parseInt(_repo[5]),parseInt(_repo[6]))
        if (newPersonRepo[""+(Record.length)]==undefined){
            newPersonRepo[""+(Record.length)]=_repo[0];
        }
        else{
            newPersonRepo[""+(Record.length)]=newPersonRepo[""+(Record.length)]+"@"+_repo[0];
        }
        $.ajax({
            url: '/moment/archive_GT_NC/',
            type: 'post',
            data: {
                name:_repo[0],
                nick_name:_repo[1],
                full_name:_repo[2],
                position:_repo[3],
                health:_repo[4],
                love:_repo[5],
                money:_repo[6],
                image:_repo[7],
                illustration:_repo[8],
                avatar:_repo[9],
                background:_repo[10]
            },
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
            }
        })

    }

    function inactive_NC(NC_record){
        $.ajax({
            url: '/moment/archive_GT_NC/',
            type: 'post',
            data: {
                archive_NC:NC_record,
            },
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
            }
        })
    }
    //Log根据名字puudown
    function downloadLog(name){
        $.ajax({
            url: '/moment/chat_log/',
            type: 'post',
            data: {contactName:name},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
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
                document.getElementById("profile_avatar").src=chatPic;
                document.getElementById("contact_name").innerHTML=response.chat_full_name;
                //document.getElementById("record").innerHTML=JSON.parse(res).love;
            },
            error:function () {
            }
        })
    }
    //为了防止contactname覆盖先传一波记录

    function updateLog(name,text){
        chat_repo[chat_repo.length-1][name]=text;
        $.ajax({
            url: '/moment/chat_log/',
            type: 'post',
            data: {contactName:name,chatLog:text},
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

    function showNewCard(title){
        var _autoMode=false;
        if(autoMode){
            _autoMode=autoMode;
            autoMode=false;
            clearInterval(autoInt);
        }
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data: {title:title},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                prores=JSON.parse(res);
                _src="";
                document.getElementById("store_card_background_over_all_front").src=prores["background"];
                document.getElementById("store_card_background_over_all_back").src=prores["background"];
                if (prores["rank"]=="N")_src="/static/moment/image/element/greemcard.png";
                if (prores["rank"]=="R")_src="/static/moment/image/element/slivercard.png";
                if (prores["rank"]=="SR")_src="/static/moment/image/element/goldcard.png";
                if (prores["rank"]=="SSR")_src="/static/moment/image/element/purplecard.png";
                document.getElementById("store_card_img_front").src=_src;
                document.getElementById("store_card_img_back").src=_src;
                document.getElementById("card_back_title").innerHTML=prores["title"];
                document.getElementById("store_card_figure").src=prores["figure"];
                _starAmount=parseInt(prores["star"]);
                if(_starAmount>5)_starAmount=5;
                for(j=1;j<=_starAmount;j++){
                    document.getElementById("SCstar"+j).style.color="#FFCC22";
                }
                for(j=_starAmount+1;j<=5;j++){
                    document.getElementById("SCstar"+j).style.color="gray";
                }
                document.getElementById("card_back_text").innerHTML=prores["illustration"];
                $("#store_card_background_over_all_front").removeClass("gray_scale");
                $("#store_card_background_over_all_back").removeClass("gray_scale");
                $("#store_card_img_front").removeClass("gray_scale");
                $("#store_card_img_back").removeClass("gray_scale");
                $("#store_card_figure").removeClass("gray_scale");
                $(".overlay_whole_SC").addClass("is-on_process");
                $("#new_tag").toggle();
                $("#flip_icon").toggle();
                document.getElementById("SC_over_all_icon").style.display="table-cell";
                document.getElementById("SC_over_all_icon").onclick=(function(){
                    $(".overlay_whole_SC").removeClass("is-on_process");
                    $("#flip_icon").toggle();
                    $("#new_tag").toggle();
                    document.getElementById("SC_over_all_icon").style.display="none";
                    if(_autoMode){
                        autoMode=true;
                        autoInt=setInterval(selectRepo,100);
                    }
                })
                document.getElementById("hint_title").innerHTML="【系统提示】";
                document.getElementById("hint_content").innerHTML="新成就达成( •̀ ω •́ )y 恭喜您获得1张"+prores["rank"]+"级别新图鉴“"+prores["title"]+"”，已存入本存档，可在【成就与商店】->【图鉴】页面查看。";
                $("#hint_window_whole").toggle();
            },
            error:function () {
            }
        })
    }

    //故事文件不同开头字母，对应不同命令
    function selectRepo(){
        if(curWordsRepo[curSenNum]==undefined){
            if(autoMode)clearInterval(autoInt);
            console.log("文件大概率结束了");
        }
        else if(curWordsRepo[curSenNum][0]){
            if (autoMode==1){
                clearInterval(autoInt);
                autoInt=setInterval(selectRepo,nonFigInterval);
            }
            switch(curWordsRepo[curSenNum][0]){
                case "!":
                    repoStatus="!";
                    specialSaveSenMark=0;
                    hintWord();
                    break;
                case "b":
                    repoStatus="b";
                    specialSaveSenMark=0;
                    dir["picDir"]=curWordsRepo[curSenNum].slice(1);
                    picpath=dir["picDir"].toString(); //change the element to string type
                    document.getElementById("body_back").style.backgroundImage="url("+picpath+")";
                    curSenNum++;
                    break;
                //sound
                //可以specialize一下sound
                case "s":
                    repoStatus="s";
                    specialSaveSenMark=0;
                    dir["soundDir"]=curWordsRepo[curSenNum].slice(1);
                    document.getElementById("backMusicAudio").pause();
                    document.getElementById("backMusic").setAttribute('src', dir["soundDir"]);
                    document.getElementById("backMusicAudio").load();
                    document.getElementById("backMusicAudio").play();
                    document.getElementById("backMusicAudio").play();
                    curSenNum++;
                    break;
                
                case "S":
                    repoStatus="S";
                    specialSaveSenMark=0;
                    document.getElementById("specialMusicAudio").pause();
                    document.getElementById("specialMusic").setAttribute('src', curWordsRepo[curSenNum].slice(1));
                    document.getElementById("specialMusicAudio").load();
                    document.getElementById("specialMusicAudio").play();
                    curSenNum++;
                    break; 
                //figure
                case "f":
                    repoStatus="f";
                    specialSaveSenMark=0;
                    _figUrl=curWordsRepo[curSenNum].slice(2);
                    if(_figUrl[0]=="n")_figUrl="";
                    switch(curWordsRepo[curSenNum][1]){
                        case "l":
                            dir["figDirLeft"]=_figUrl;
                            document.getElementById("story_figure_left").src=_figUrl;
                            break;
                        case "r":
                            dir["figDirRight"]=_figUrl;
                            document.getElementById("story_figure_right").src=_figUrl;
                            break;
                        case "c":
                            dir["figDirCenter"]=_figUrl;
                            document.getElementById("story_figure_center").src=_figUrl;
                            break;
                        case "f":
                            $("#film_background").css({'background-image': "url("+_figUrl+")"});
                            break;
                    }
                    curSenNum++;
                    break;  
                //button
                case "a":{
                //document.getElementById("buttonBack").innerHTML="No Back Temperarily";
                    document.getElementById("button_list_all").style.display="block";
                    if(autoMode)clearInterval(autoInt);
                    repoStatus="a";
                    buttonMark=1;
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum-1;//把提示句子也圈进去，所以-1
                    buttonIndex=parseInt(curWordsRepo[curSenNum][1]);
                    buttonLine=buttonIndex*2;
                    curSenNum++;
                    for(var ai=0;ai<buttonLine;ai++){
                        if (ai%2==0){
                            buttonFile=curWordsRepo[curSenNum];
                            curSenNum++;
        
                        }
                        if (ai%2==1){
                            buttonContent=curWordsRepo[curSenNum];
                            buttonList();
                            curSenNum++;
                        }
                    }
                }
                    document.getElementById("button_list_all").style.display="block";
                    recordRecord();
                    break;
                //voice
                case "v":
                    repoStatus="v";
                    specialSaveSenMark=0;
                    curWorsContent=curWordsRepo[curSenNum].slice(1);
                    if(curWordsRepo[curSenNum][1]!=")")speakStory("story_words",1);
                    else {
                        curWorsContent=curWordsRepo[curSenNum].slice(2);
                        speakStory("film_content",2);
                    }
                    break;
                //jump
                case "j":
                    repoStatus="j";
                    specialSaveSenMark=0;
                    if(curWordsRepo[curSenNum][1]=="s"){
                        jumpNum=parseInt(strip(curWordsRepo[curSenNum].slice(2)));
                        simpleJumpSen(jumpNum-1);
                    }
                    else if(curWordsRepo[curSenNum][1]=="f"){
                        jumpNum=parseInt(strip(curWordsRepo[curSenNum].slice(2)));
                        curSenNum++;
                        jumpFile=curWordsRepo[curSenNum];
                        simpleJumpFile(jumpFile,jumpNum);
                    }
                    break;
                //更改name tag
                case "t":
                    repoStatus="t";
                    specialSaveSenMark=0;
                    nameTag=strip(curWordsRepo[curSenNum].slice(1));
                    if (nameTag.includes("...") || nameTag.includes("我") || nameTag.includes("PP") || nameTag.includes("Zoe") || nameTag.includes("2019年"))document.getElementById("story_words_tag").style.color="#4F4F4F";
                    else document.getElementById("story_words_tag").style.color="black";
                    document.getElementById("story_words_tag").innerHTML=nameTag;
                    if (nameTag=="..." || nameTag=="我" || nameTag.includes("2019年") || nameTag.includes("PP") || nameTag.includes("Zoe"))document.getElementById("story_words").style.color="#4F4F4F";
                    else document.getElementById("story_words").style.color="black";
                    curSenNum++; 
                    break;
                //record
                case "r":
                    repoStatus="r";
                    specialSaveSenMark=1;
                    property_change();
                    specialSaveSenNum=curSenNum;//对于save 对于update在函数里定义
                    //不要重复change property 所以先不要定义 special sennumber
                    break;
                //得到新图鉴
                case "u":
                    repoStatus="u";
                    specialSaveSenMark=0;//一般在cCtag中出现
                    _title=strip(curWordsRepo[curSenNum].slice(1));
                    showNewCard(_title);
                    curSenNum++;
                    break;
                case "c":
                    repoStatus="c";
                    specialSaveSenMark=1;
                    _curSenNum=curSenNum;
                    specialSaveSenNum=_curSenNum;
                    continueMark=1;
                    document.getElementById("buttonBack").disabled=true;
                    if(curWordsRepo[curSenNum][1]=="f"){

                        $("#film_mode").fadeToggle(2000);

                    }
                    curSenNum++;
                    continueInt=setInterval(selectRepo,100);
                    //if (curWordsRepo[curSenNum][0]=="C")specialSaveSenNum=curSenNum+1;
                    break;
                case "C":
                    repoStatus="C";
                    specialSaveSenMark=0;
                    if(curWordsRepo[curSenNum][1]=="f" && continueMark==1){
                       // curSenNum++;
                        $("#film_mode").fadeToggle(2000);

                    }
                    continueMark=0;
                    curSenNum++;
                    clearInterval(continueInt);
                    document.getElementById("buttonBack").disabled=false;
                    break;
                case "$":
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum+1;
                    archive_GT();
                    curSenNum++;
                    break;
                case "@":
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum+1;
                    archive_NC();
                    generate_contact();
                    flushChatCircle();
                    curSenNum++;
                    break;
                case "m":
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum+2;
                    wetherKeep=(strip(curWordsRepo[curSenNum].slice(1))==contactName);//看看是否联系窗口不变
                    generate_contact();
                    contactName=strip(curWordsRepo[curSenNum].slice(1));
                    /* if (!wetherKeep) */
                    updateRead("unread",contactName);
                    /* else updateRead("read",contactName); */
                    //console.log("contactname zai m yujuhou  "+contactName)
                    curSenNum++;
                    //contact_fakeMsg.push(curWordsRepo[curSenNum].slice(1));
                    downloadLog(contactName);
                    if (curWordsRepo[curSenNum][0]=="u"){
                        msgText=curWordsRepo[curSenNum].slice(1);
                        msg = $("<div>").addClass("message");
                        msg.text(msgText);
                        msg.addClass("personal").appendTo($('.mCSB_container'));
                        chatLog.push("u"+msgText);
                    }
                    else{
                        msgText=curWordsRepo[curSenNum];
                        msg = $("<div>").addClass("message");
                        msg.text(msgText);
                        msg.appendTo($('.mCSB_container'));
                        chatLog.push("o"+msgText);
                    }
                    updateScrollbar();
                    updateLog(contactName,chatLog.join("@"));
                    updateScrollbar();
                    curSenNum++;
                    break;
                case "M":
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum+1;
                    contact_fakeMsg.push(curWordsRepo[curSenNum].slice(1));
                    curSenNum++;
                    break;
                case "i":
                    specialSaveSenMark=0;
                    introName=strip(curWordsRepo[curSenNum].slice(1));
                    showIntro(introName);
                    curSenNum++;
                    break;
                default:
                    var suibiandedaima=0;         
            }
        }
    }

    function showIntro(introName){
        postData={name:introName};
        $.ajax({
            url: '/moment/archive_GT_NC/',
            type: 'post',
            data: postData,
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                document.getElementById("ink_value_love").innerHTML=response["love"];
                document.getElementById("ink_value_money").innerHTML=response["money"];
                document.getElementById("ink_value_health").innerHTML=response["health"];
                document.getElementById("name_card_figure_img").src=response["image"];
                document.getElementById("intro_name").innerHTML=response["full_name"];
                document.getElementById("intro_illus").innerHTML=response["illustration"];
                document.getElementById("intro_background").src=response["background"];
                $("#intro_human").toggle();
                intro_human_toggle=setTimeout(function(){$("#intro_human").toggle();},3000);
            },
            error:function () {
            }
        })
    }


    
//每次单击界面 要不读取新的文件，要不出现下一个语句
document.getElementById("story_words_background").onclick=(function(){
    if(!autoMode){
        if(initialStoryMark==0 && enterStoryMark==0)initialStory();
        selectRepo();
    }
});
if(enterStoryMark==0){
    initialRecordStory(); //直接set
    selectRepo();
}


//各个按钮函数定义

//返回
document.getElementById("buttonBack").onclick=(function(){
    if(Record.length>0)popRecord();
});

//存档
function saveArch(){
    if (specialSaveSenMark==0)currentSentenceNumberValue=curSenNum-1;//因为每次点击出来都会+1
    else currentSentenceNumberValue=specialSaveSenNum;
    if (continueMark==1)currentSentenceNumberValue=_curSenNum;
    date=new Date()
    dateString=date.getFullYear().toString()+"年"+date.getMonth().toString()+"月"+date.getDate().toString()+"日 "+date.getHours().toString()+":"+date.getMinutes().toString();
    post_data={ activeState:1,
        currentArchiveId:__currentArchiveId,
        currentSentenceNumber:currentSentenceNumberValue,
        recordDir:dir["storyDir"],
        lastSentence:curWorsContent,
        lastFigureLeft:dir["figDirLeft"],
        lastFigureRight:dir["figDirRight"],
        lastFigureCenter:dir["figDirCenter"],
        lastPic:dir["picDir"],
        lastSound:dir["soundDir"],
        date:dateString,
   
    };
    for (var i=0;i<Object.keys(Human_repo).length;i++){
        _name=name_repo[i];
        post_data[_name+"Health"]=Human_repo[_name].health;
        post_data[_name+"Love"]=Human_repo[_name].love;
        post_data[_name+"Money"]=Human_repo[_name].money;
    }
    $.ajax({
        url: '/moment/savearchive/',
        type: 'post',
        data: post_data,
        async:false,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            //document.getElementById("record").innerHTML=JSON.parse(res).love;
        },
        error:function () {
        }
    })
    //chat_log save
    _chat_log=chat_repo[chat_repo.length-1]; //有各种名字的一级{"XF":["WA","QWDQ"],"TY":["dw",["das"]}
    //将chat_window数据库更新
    for (var key in _chat_log){
        if (key=="~~")delete _chat_log[key]; //initial 每个文件的记录时候push的
        else{
            _chat_content=_chat_log[key];
            $.ajax({
                url: '/moment/chat_log/',
                type: 'post',
                data: {contactName:key,chatLog:_chat_content},
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
    }
}
document.getElementById("buttonSave").onclick=(function(){
    $("#promote_window_whole").toggle();
    document.getElementById("promote_title").innerHTML="【系统提示】";
    document.getElementById("promote_content").innerHTML="您的存档已自动保存，\n点击【确定】前往存档馆（可切换存档） \n点击【取消】继续游戏( •̀ ω •́ )y";
    document.getElementById("promote_cancel_btn").onclick=(function(){
        $("#promote_window_whole").toggle();
        saveArch();
    })
    document.getElementById("promote_confirm_btn").onclick=(function(){
        saveArch();
        window.location.href="../galcate/"
    })
})

//跳转去成就
/* document.getElementById("buttonAchieve").onclick=(function(){
    saveArch();
    window.location.href="../process/";
})
 */
//auto play
document.getElementById("auto_play").onclick=(function(){
//click button change
    event.stopPropagation();
    switch(document.getElementById("auto_icon").className){
        case "glyphicon glyphicon-pause":
            autoMode=false;
            beforeFilmAutoMode=false;
            document.getElementById("auto_icon").className="glyphicon glyphicon-play";
            clearInterval(autoInt); 
            document.getElementById("buttonBack").disabled=false;           
            break;
        case "glyphicon glyphicon-play":
            autoMode=true;
            beforeFilmAutoMode=true;
            document.getElementById("auto_icon").className="glyphicon glyphicon-pause";
            document.getElementById("buttonBack").disabled=true;
            autoInt=setInterval(selectRepo,100);
            break;
    }
})
//右侧setting按钮
document.getElementById("setting_btn").onclick=(function(){
    $("#audio_window_whole").toggle();
})
document.getElementById("audio_close_icon").onclick=(function(){
    $("#audio_window_whole").toggle();
})

//保存
document.getElementById("onlySave").onclick=(function(){
    document.getElementById("hint_title").innerHTML="【系统提示】";
    document.getElementById("hint_content").innerHTML="保存成功，欢迎继续游戏~O(∩_∩)O";
    $("#hint_window_whole").toggle();
    saveArch();
})

//logout
document.getElementById("buttonLogout").onclick=(function(){
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

//提示小窗按钮定义
/* document.getElementById("promote_close_icon").onclick=(function(){
    $("#promote_window_whole").toggle();
})
document.getElementById("hint_close_icon").onclick=(function(){
    $("#hint_window_whole").toggle();
}) */

/* if (autoMode){
    autoInt=setInterval(selectRepo,100);
} */


