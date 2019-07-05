$.ajaxSetup({
    async:false,});

//console.log("loading pic");
var imageSrcs = [];
var images = [];
var loadSucessRepo=[];
var fileDirUrl="/static/moment/story/1";
function tryCallback(callback) {
    var allImagesLoaded = (function(){
        for (var i = images.length; i--;) {
            if (images[i].isLoaded){
                if(!loadSucessRepo.includes(i))loadSucessRepo.push(i);
                //console.log("load ok")
                //console.log(loadSucessRepo);
            }
            if(!images[i].isLoaded){
                return false;
            }
        }
        return true;
    })();

    if(allImagesLoaded) {
        callback();
    }
};

function preloadImages(callback) {
    var remaining = imageSrcs.length;
    //console.log("called")
    //console.log(remaining);
    var image;
    for (i = 0; i < imageSrcs.length; i++) {
        //img = new Image();
        //img.src = imageSrcs[i];
/*         image= new Image();
        images.push(image);
		image.onload = function() {
			this.isLoaded = true;
			tryCallback();
		};
        images[i].src = imageSrcs[i];
        --remaining;
        console.log(remaining);
        loadingVue.ok= static_remain- remaining; */
        var imageSrc = imageSrcs[i];
		var image = document.createElement('img');
		images.push(image);
		image.onload = function() {
			this.isLoaded = true;
			tryCallback(callback);
		};
		image.src = imageSrc;

    }
}
function finishLoading(){
    //console.log("finish!");
    document.getElementById("loading_section").style.display="none"
    //window.location.href="../galcate/";
}
function preLoadRepo(fileDir,callback){
    imageSrcs=[];
    var dirUrlRoot="/static/moment/story/";
        fileDir=dirUrlRoot+"preload";
        $.get(fileDir, function (content) {
            allRepo = content.split("\n");
            for (var i=0;i<allRepo.length;i++){
                if (allRepo[i][0]!="@"){
                    if (strip(allRepo[i]).endsWith("png") || strip(allRepo[i]).endsWith("jpg") || strip(allRepo[i]).endsWith("JPG") || strip(allRepo[i]).endsWith("PNG")){
                        startVal=allRepo[i].indexOf("/static/");
                        imgUrl=allRepo[i].slice(startVal);
                        if(!imageSrcs.includes(imgUrl))imageSrcs.push(imgUrl);
                    }
                }
                if (allRepo[i][0]=="@"){
                    _content=allRepo[i].slice(1);
                    _contentRepo=_content.split("#");
                    for (var j=0;j<_contentRepo.length;j++){
                        if (strip(_contentRepo[j]).endsWith("png") || strip(_contentRepo[j]).endsWith("jpg") || strip(_contentRepo[j]).endsWith("JPG") || strip(_contentRepo[j]).endsWith("PNG")){
                            imgUrl=_contentRepo[j];
                            if(!imageSrcs.includes(imgUrl))imageSrcs.push(imgUrl);
                        }
                    }
                }
                
            }
    });
    preloadImages(callback);
}
// then to call it, you would use this
preLoadRepo(fileDirUrl,finishLoading);
