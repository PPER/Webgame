$(document).ready(function (){

document.getElementById('archive').onclick=(function(){
    $.ajax({
        url: '/moment/wonder_archive/',
        type: 'post',
        data: {},
        async:true,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
           response=JSON.parse(res);
           objectAmount=parseInt(response["amount"]);
           contentHtml=document.getElementById("content");
           for(i=1;i<=objectAmount;i++){
               console.log(i);
               var personCard=document.createElement("div"); //"col-sm-6 col-md-4"
               personCard.className="col-sm-6 col-md-4";
               var thumbnail=document.createElement("div"); //"thumbnail"
               thumbnail.className="thumbnail";
               var image=document.createElement("img");
               image.src=response["imageUrl"+i];
               var caption=document.createElement("div"); //caption
               caption.className="caption";
               var h3=document.createElement("h3"); //h3
               h3.innerHTML=response["personName"+i];
               var p1=document.createElement("p"); //p1
               p1.innerHTML=response["personText"+i];
               var p2=document.createElement("p"); //p2
               var section=document.createElement("section"); //section
               var button1=document.createElement("button"); //button1
               button1.className="lined thin";
               button1.id="button"+i+"_1";
               button1.innerHTML=response["buttonText"+i+"_1"];
               var button2=document.createElement("button"); //button2
               button2.className="lined thin";
               button2.id="button"+i+"_2";
               button2.innerHTML=response["buttonText"+i+"_2"]
               section.appendChild(button1);
               section.appendChild(button2);
               p2.appendChild(section);
               caption.appendChild(h3);
               caption.appendChild(p1);
               caption.appendChild(p2);
               thumbnail.appendChild(image);
               thumbnail.appendChild(caption);
               personCard.appendChild(thumbnail);
               contentHtml.appendChild(personCard);
           }
        },
        error:function () {
            console.log("failed");
        }
    })

})

document.getElementById('Personal Imformation').onclick=(function(){
    $.ajax({
        url: '/moment/wonder_archive/',
        type: 'post',
        data: {},
        async:true,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {},
        error:function(){}
    })
})

document.getElementById('gift').onclick=(function(){
    $.ajax({
        url: '/moment/wonder_archive/',
        type: 'post',
        data: {},
        async:true,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {},
        error:function(){}
    })
})

})