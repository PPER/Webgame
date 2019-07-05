var imageSrcsBack=[];
function backLoadImages() {
    var image;
    for (i = 0; i < imageSrcsBack.length; i++) {
        var imageSrc = imageSrcsBack[i];
		var image = document.createElement('img');
        image.src = imageSrc;
        console.log("load pic: "+imageSrc)

    }
}

function backLoadRepo(){
    var dirUrlRoot="/static/moment/story/";
    for (i=2;i<5;i++){
        fileDir=dirUrlRoot+i;
        $.ajax({url: fileDir,async:true, success: function(content){
            allRepo = content.split("\n");
            for (var i=0;i<allRepo.length;i++){
                if (allRepo[i][0]!="@"){
                    if (strip(allRepo[i]).endsWith("png") || strip(allRepo[i]).endsWith("jpg") || strip(allRepo[i]).endsWith("JPG") || strip(allRepo[i]).endsWith("PNG")){
                        startVal=allRepo[i].indexOf("/static/");
                        imgUrl=allRepo[i].slice(startVal);
                        if(!imageSrcs.includes(imgUrl))imageSrcsBack.push(imgUrl);
                    }
                }
                if (allRepo[i][0]=="@"){
                    _content=allRepo[i].slice(1);
                    _contentRepo=_content.split("#");
                    for (var j=0;j<_contentRepo.length;j++){
                        if (strip(contentRepo[j]).endsWith("png") || strip(contentRepo[j]).endsWith("jpg") || strip(contentRepo[j]).endsWith("JPG") || strip(contentRepo[j]).endsWith("PNG")){
                            imgUrl=contentRepo[j];
                            if(!imageSrcs.includes(imgUrl))imageSrcsBack.push(imgUrl);
                        }
                    }
                }
                
            }
//load  
        backLoadImages();
          }});

}
}
// then to call it, you would use this
backLoadRepo();