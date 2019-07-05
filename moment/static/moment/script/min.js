$(document).ready(function (){
    /* content=""
    $.ajax({
        url:"/moment/recordtemp/",
        dataType:"json",
        success: function (data) {
            content=data["info"];
        }
    });
    document.getElementById("record").innerHTML=content; */

   // content={{love}};
    //document.getElementById("record").innerHTML=content;
    $.ajax({
        url: '/moment/recordtemp/',
        type: 'post',
        data: {love:"pzy suffers",
                reality:"imposiible"},
        async:true,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            document.getElementById("record").innerHTML=JSON.parse(res).love;
        },
        error:function () {

        }
    });

})