//禁用右键
document.oncontextmenu = function () { return false; };
//禁用选中
document.onselectstart = function () { return false; };
//$.ajaxSetup({async:false});
//https://blog.csdn.net/qq_39640877/article/details/80566584
$.ajaxSetup({
    cache:false, 
    async:false,});

$(document).ready(function (){
    const  rootPath="/static/moment/";
    var dir={
        recordDir: rootPath+ "record/1",
        storyDir: rootPath+ "story/00",
        picDir: rootPath+ "image/pic/",
        soundDir: rootPath+ "sound/",
        figDir: rootPath+ "image/figure/",
    };  
                
    var __currentAchieveId=1; //现在的存档标号
    var enterStoryMark=0; //最初进入故事
    var specialSaveSenMark=0; //如果存档的时候刚好是record或者按钮相关，把它变成1，然后下次load specialSaveSenNum
    var specialSaveSenNum;
    var StoryDir_repo=new Array();
    var curWordsRepo;
    const setupLine=3; //前3行初始化
    var curSenNum=0;
    var initialStoryMark=0;
    var effectMark=2;  //stpe effect
    var aeFunc; //time reserve ID
    var buttonContent;
    var buttonFile;
    var Record=new Array(); //记录
    var Human_repo={}; //人的集合


    //人物初始设定 变量+加入repo 
    _HGG=new Person("hgg",60,50,100);
    _PP=new Person("pp",100,50,0);
    Human_repo["hgg"]=_HGG;
    Human_repo["pp"]=_PP;

    

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
    
    //存档选择
    document.getElementById("")
    //记录
    function recordRecord(){
        StoryDir_repo.push(dir["storyDir"]);
        Record.push({
            "hgg_love": _HGG.love,
            "hgg_money": _HGG.money,
            "hgg_health": _HGG.health,
            "pp_love": _PP.love,
            "pp_money": _PP.money,
            "pp_health": _PP.health, 
        });
    }
    //记录弹出，回到上一级文件
    function popRecord(){
        StoryDir_repo.pop();//先把这一级文件pop掉
        dir["storyDir"]=StoryDir_repo.pop();
        Record.pop();//上一级文件完成的记录
        var tempRecord;
        tempRecord=Record.pop();//因为loadfile要push一个上上级文件记录进去，所以先把那个pop出来
        _HGG.health=tempRecord["hgg_health"];
        _HGG.love=tempRecord["hgg_love"];
        _HGG.money=tempRecord["hgg_money"];
        _PP.health=tempRecord["pp_health"];
        _PP.love=tempRecord["pp_love"];
        _PP.money=tempRecord["pp_money"];
        initialStory();//故事初始化       
    }

    //对象属性改变
    function property_change(){
        var human_name;
        _recordLine=parseInt(curWordsRepo[curSenNum][1]);
        curSenNum++;
        for(var rindex=0;rindex<_recordLine;rindex++){
            switch(curWordsRepo[curSenNum][0]){
                case "*":
                    if(curWordsRepo[curSenNum][1]=="h")human_name="hgg";
                    if(curWordsRepo[curSenNum][1]=="p")human_name="pp";
                    //human_name=String(curWordsRepo[curSenNum].slice(1));蜜汁不知道为什么不可以
                    curSenNum++;
                    console.log("pp's"+"  health="+_PP.health+";  love="+_PP.love+";   money="+_PP.money);
                    console.log("hgg's"+"  health="+_HGG.health+";  love="+_HGG.love+";   money="+_HGG.money);
                    break;
                
                case "h":
                    if(curWordsRepo[curSenNum][1]=="+")Human_repo[human_name].AddHealth(parseInt(curWordsRepo[curSenNum].slice(2)));
                    else Human_repo[human_name].DelHealth(parseInt(curWordsRepo[curSenNum].slice(2)));
                    curSenNum++;
                    console.log("###########")
                    console.log("hgg helath:  "+$.type(_HGG.health))
                    console.log("###########")
                    console.log("pp's"+"  health="+_PP.health+";  love="+_PP.love+";   money="+_PP.money);
                    console.log("hgg's"+"  health="+_HGG.health+";  love="+_HGG.love+";   money="+_HGG.money);
                    break;
                
                case "m":
                    if(curWordsRepo[curSenNum][1]=="+")Human_repo[human_name].AddMoney(parseInt(curWordsRepo[curSenNum].slice(2)));
                    else Human_repo[human_name].DelMoney(parseInt(curWordsRepo[curSenNum].slice(2)));
                    curSenNum++;
                    console.log("pp's"+"  health="+_PP.health+";  love="+_PP.love+";   money="+_PP.money);
                    console.log("hgg's"+"  health="+_HGG.health+";  love="+_HGG.love+";   money="+_HGG.money);
                    break;
                   
                case "l":
                    if(curWordsRepo[curSenNum][1]=="+")Human_repo[human_name].AddLove(parseInt(curWordsRepo[curSenNum].slice(2)));
                    else Human_repo[human_name].DelLove(parseInt(curWordsRepo[curSenNum].slice(2)));
                    curSenNum++;
                    console.log("pp's"+"  health="+_PP.health+";  love="+_PP.love+";   money="+_PP.money);
                    console.log("hgg's"+"  health="+_HGG.health+";  love="+_HGG.love+";   money="+_HGG.money);
                    break;   
            }
        }


    }
    //将故事文件内容读取
    function loadRecord(){
        var _record;
        $.get(dir["recordDir"], function (content) {
            _record = content.split("\n");
        });
        __currentAchieveId=parseInt(_record[0]);
        curSenNum=parseInt(_record[1]);
        dir["storyDir"]=_record[2];
        _HGG.health=parseInt(_record[3]);
        _HGG.love=parseInt(_record[4]);
        _HGG.money=parseInt(_record[5]);
        _PP.health=parseInt(_record[6]);
        _PP.love=parseInt(_record[7]);
        _PP.Money=parseInt(_record[8]);

    }
    function loadFile() {
        //loadRecord(); //把信息记录一下
        initialStoryMark=0;
        curSenNum=0;
        document.getElementById("button_list").innerHTML=" ";
        $.get(dir["storyDir"], function (content) {
            curWordsRepo = content.split("\n");
        });
        recordRecord(); //每次开启文件，记录同步到上一个文件结束处
    }

    //初始化有存档的story
    function initialRecordStory(){
        loadRecord();
        console.log("load的结果运行到第几行：  "+curSenNum);
        document.getElementById("button_list").innerHTML=" ";
        $.get(dir["storyDir"], function (content) {
            curWordsRepo = content.split("\n");
        });
        recordRecord(); //每次开启文件，记录同步到上一个文件结束处
        if (curSenNum<3){
            curSenNum=0;
            initialSetup();
        }
        else {
            _storeCurSenNum=curSenNum;
            curSenNum=0;
            initialSetup();
            curSenNum=_storeCurSenNum;
        }
        console.log("初始化北京等等后从第几行开始运行到第几行：  "+curSenNum);
        enterStoryMark=1;
        initialStoryMark=1;
    }

    //初始化一般的情况
    function initialStory(){
        loadFile();
        //清空
        document.getElementById("story_words").innerHTML=" ";
        if (Record.length>1)document.getElementById("buttonBack").innerHTML="Back";
        if (Record.length<=1)document.getElementById("buttonBack").innerHTML="No Back";
        //console.log(Human_repo);
        //initialize
        initialStoryMark=1;
        initialSetup();    
    }
    //story文件前三行的setup
    function initialSetup(){
        for(;curSenNum<setupLine;curSenNum++){
            console.log("loop called cursennum is: "+curSenNum);
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
                    document.getElementById("story_sound").src=dir["soundDir"];
                    break;

                //figure
                case "f":
                    dir["figDir"]=curWordsRepo[curSenNum].slice(1);
                    document.getElementById("story_figure").src=dir["figDir"];
                    break;
            }

        }
        console.log("inital setup以后的行数");
    }

    function buttonList(){
        console.log("buttonList called")
        buttonIndex++;
        newButton=document.createElement("button");
        newButton.id=buttonFile;
        console.log(buttonFile);
        newButton.className="dashed thin"; 
        //newButton.setAttribute("data-title",buttonContent);
        newButton.innerHTML=buttonContent;
        document.getElementById("button_list").appendChild(newButton);
        //var br=document.createElement("div"); 
        //br.innerHTML="<br/>"; 
        //document.getElementById("button_list").appendChild(br);
        document.getElementById(buttonFile).onclick= function(){      
            dir["storyDir"]=this.id;
            console.log("超链接绑定");
            //loadFile();
            initialStory();
        }; 

    }
    
    function affterEffect(cwords,id) {
        var index=0;
        var words=cwords;
        function _affterEffect(){
            document.getElementById(id).innerHTML+=words[index++];
            if(index==words.length) {
                effectMark=2;
                curSenNum++;
                clearInterval(aeFunc);
            }
        }
        aeFunc=setInterval(_affterEffect,100);
    }

    function speakStory(){
        effectMark--;
        if(effectMark<=0){
            clearInterval(aeFunc);
            console.log(curWordsRepo[curSenNum])
            document.getElementById("story_words").innerHTML=curWordsRepo[curSenNum].slice(1);
            effectMark=2;
            curSenNum++;
        }
       
        if(effectMark==1){
            document.getElementById("story_words").innerHTML=" ";
            affterEffect(curWordsRepo[curSenNum].slice(1),"story_words");
        }

    }
    
    //故事文件不同开头字母，对应不同命令
    function selectRepo(){
        if(curWordsRepo[curSenNum][0]){
            switch(curWordsRepo[curSenNum][0]){
                case "b":
                    specialSaveSenMark=0;
                    dir["picDir"]=curWordsRepo[curSenNum].slice(1);
                    picpath=dir["picDir"].toString(); //change the element to string type
                    document.getElementById("body_back").style.backgroundImage="url("+picpath+")";
                    curSenNum++;
                    break;
                //sound
                //可以specialize一下sound
                case "s":
                    specialSaveSenMark=0;
                    dir["soundDir"]=curWordsRepo[curSenNum].slice(1);
                    document.getElementById("story_sound").src=dir["soundDir"];
                    curSenNum++;
                    break; 
                //figure
                case "f":
                    specialSaveSenMark=0;
                    dir["figDir"]=curWordsRepo[curSenNum].slice(1);
                    document.getElementById("story_figure").src=dir["figDir"];
                    curSenNum++;
                    break;  
                //button
                case "a":{
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum;
                    buttonIndex=parseInt(curWordsRepo[curSenNum][1]);
                    console.log("buttonIndex= "+buttonIndex);
                    curSenNum++;
                    console.log("现在所在的行数："+curSenNum)
                    for(var ai=0;ai<6;ai++){
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
                    console.log("现在所在的行数："+curSenNum)
                }
                    break;
                //voice
                case "v":
                    specialSaveSenMark=0;
                    speakStory();
                    break;
                //record
                case "r":
                    specialSaveSenMark=1;
                    specialSaveSenNum=curSenNum;
                    property_change();
                    break;

                default:
                    var suibiandedaima=0;         
            }
        }
        else console.log("文件读完了");
    }
    
//每次单击界面 要不读取新的文件，要不出现下一个语句
document.getElementById("story_words_background").onclick=(function(){
    if(enterStoryMark==0)initialRecordStory();
    else if(initialStoryMark==0)initialStory();
    selectRepo();
});


//各个按钮函数定义

//返回
document.getElementById("buttonBack").onclick=(function(){
    console.log(Record.length);
    if(Record.length>1)popRecord();
});

//存档
document.getElementById("buttonSave").onclick=(function(){
    if (specialSaveSenMark==0)currentSentenceNumberValue=curSenNum-1;//因为每次点击出来都会+1
    else currentSentenceNumberValue=specialSaveSenNum;
    $.ajax({
        url: '/moment/saveachieve/',
        type: 'post',
        data: { currentAchieveId:__currentAchieveId,
                currentSentenceNumber:currentSentenceNumberValue,
                recordDir:dir["storyDir"],
                hggHealth:_HGG.health,
                hggLove:_HGG.love,
                hggMoney:_HGG.money,
                ppHealth:_PP.health,
                ppLove:_PP.love,
                ppMoney:_PP.money,
        },
        async:true,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            //document.getElementById("record").innerHTML=JSON.parse(res).love;
        },
        error:function () {

        }
    })
})


});