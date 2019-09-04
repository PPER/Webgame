var imageSrcsBack=[];
function backLoadImages() {
    var image;
    for (i = 0; i < imageSrcsBack.length; i++) {
        var imageSrc = imageSrcsBack[i];
		var image = document.createElement('img');
        image.src = imageSrc;
        //console.log("load pic: "+imageSrc)

    }
}

function backLoadRepo(){
    var dirUrlRoot="/static/moment/story/";
        fileDir=dirUrlRoot+"2_eng";
        $.ajax({url: fileDir,async:true, success: function(content){
            allRepo = content.split("\n");
            for (var i=0;i<allRepo.length;i++){
                if (allRepo[i][0]!="@"){
                    if (strip(allRepo[i]).endsWith("png") || strip(allRepo[i]).endsWith("jpg") || strip(allRepo[i]).endsWith("JPG") || strip(allRepo[i]).endsWith("PNG")){
                        startVal=allRepo[i].indexOf("/static/");
                        imgUrl=allRepo[i].slice(startVal);
                        if(!imageSrcsBack.includes(imgUrl))imageSrcsBack.push(imgUrl);
                    }
                }
                if (allRepo[i][0]=="@"){
                    _content=allRepo[i].slice(1);
                    _contentRepo=_content.split("#");
                    for (var j=0;j<_contentRepo.length;j++){
                        if (strip(_contentRepo[j]).endsWith("png") || strip(_contentRepo[j]).endsWith("jpg") || strip(_contentRepo[j]).endsWith("JPG") || strip(_contentRepo[j]).endsWith("PNG")){
                            imgUrl=_contentRepo[j];
                            if(!imageSrcsBack.includes(imgUrl))imageSrcsBack.push(imgUrl);
                        }
                    }
                }
                
            }
//load  
        backLoadImages();
          }});

}

// then to call it, you would use this
backLoadRepo();
