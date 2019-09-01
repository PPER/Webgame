var intro_human_toggle; //点击取消story js里的 timeout
$(document).ready(function (){

    var statusMark;
    var statusValue={"a":false,"g":false,"c":false,"s":false};
    var initialArchiveID;
    var archiveID;
    var redefineMark=0;
    var _autoMode=false;
    //读取存档号
    $.ajax({
        url: '/moment/read_archive_id/',
        type: 'post',
        data:{},
        async:false,
        csrfmiddlewaretoken:'{{ csrf_token }}',
        success: function (res) {
            initialArchiveID=parseInt(JSON.parse(res).archive_id);
            archiveID=initialArchiveID;
            _htmlidname="no"+archiveID+"arch";
            $("#"+_htmlidname).addClass("clickButton");
            //console.log("现在的id时："+archiveID);
        },
        error:function () {
            //console.log("faillllllll：");
        }
    })

    //重定义archive id
    document.getElementById("no1arch").onclick=(function(){
        $("#no1arch").addClass("clickButton");
        $("#no2arch").removeClass("clickButton");
        $("#no3arch").removeClass("clickButton");
        redefineMark=1;
        archiveID=1;
        redefineID(archiveID);
        flush();
    })
    document.getElementById("no2arch").onclick=(function(){
        $("#no2arch").addClass("clickButton");
        $("#no1arch").removeClass("clickButton");
        $("#no3arch").removeClass("clickButton");
        redefineMark=1;
        archiveID=2;
        redefineID(archiveID);
        flush();
    })
    document.getElementById("no3arch").onclick=(function(){
        $("#no3arch").addClass("clickButton");
        $("#no1arch").removeClass("clickButton");
        $("#no2arch").removeClass("clickButton");
        redefineMark=1;
        archiveID=3;
        redefineID(archiveID);
        flush();
    })
    function redefineID(id){
        $.ajax({
            url: '/moment/define_archive_id/',
            type: 'post',
            data: {archive_id:id},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                //console.log("successfully push");
            },
            error:function () {
    
            }
        })
    }
    //flush
    function flush(){
        switch(statusMark){
            case "a":
                flushNameCard();
                break;
            case "g":
                flushGift();
                break;
            case "c":
                flushStoreCard();
                break;
            case "s":
                flushShoppingCart();
                break;

        }
    }

    //define button
    //跳出
    $("#main_store").click(function () {
        //console.log("click process")
        statusValue[statusMark]=false;
        flush();
        $("#process").fadeIn(300);
        $(".overlay_whole_process").addClass("is-on");
        if(autoMode){
            _autoMode=autoMode;
            autoMode=false;
            clearInterval(autoInt);
        }
    });

   
    //存档
    document.getElementById("Arch").onclick=(function(){
        $("#process_drop_down_arch").toggle();
    })
    //名片
    document.getElementById('archive').onclick=(function(){
        redefineMark=0;
        flushNameCard();
    });
    //礼物
    document.getElementById('gift').onclick=(function(){
        redefineMark=0;
        flushGift();
    });
    //图鉴
    document.getElementById('store_card').onclick=(function(){
        redefineMark=0;
        flushStoreCard();
    });
    //商店
    document.getElementById('shopping').onclick=(function(){
        redefineMark=0;
        flushShoppingCart();
    });
    //关闭
    document.getElementById("process_close").onclick=(function(){
        redefineID(initialArchiveID);
        $("#process").fadeOut(300);
        $(".overlay_whole_process").removeClass("is-on");
        //console.log("close process");
        //可能存在的window都关掉
        document.getElementById("promote_window_whole").style.display="none";
        document.getElementById("hint_window_whole").style.display="none";
        //auto
        if(_autoMode){
            autoMode=true;
            autoInt=setInterval(selectRepo,100);
        }
    })
    //promote hint window关闭
    document.getElementById("promote_close_icon").onclick=(function(){
        $("#promote_window_whole").toggle();
    })
    document.getElementById("hint_close_icon").onclick=(function(){
        $("#hint_window_whole").toggle();
    })
    document.getElementById("hint_cancel_btn").onclick=(function(){
        $("#hint_window_whole").toggle();
    })
    //物品架关闭
    document.getElementById("own_close_icon").onclick=(function(){
        $("#own_window_whole").toggle();
    })
    //shopping window 关闭
    document.getElementById("cart_over_close").onclick=(function(){
        $("#cart_over").toggle();
    })
    //
    document.getElementById("intro_human").onclick=(function(){
        $("#intro_human").toggle();
        clearTimeout(intro_human_toggle);
    })
    //关闭放大图鉴
    document.getElementById("SC_over_all_icon").onclick=(function(){
        $(".overlay_whole_SC").removeClass("is-on_process");
        $("#flip_icon").toggle();
        document.getElementById("SC_over_all_icon").style.display="none";
    })

    //购物车加减按钮
    $('.plus_btn').on('click', function(e) {
        var val = parseInt($(this).prev('input').val());
        $(this).prev('input').val(val + 1).change();
      });
    
    $('.minus_btn').on('click', function(e) {
        var val = parseInt($(this).next('input').val());
        if (val !== 0) {
          $(this).next('input').val(val - 1).change();
        }
    });

    function flushShoppingCart(){
        statusMark="s";
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data: {status_mark:statusMark, status_value:statusValue[statusMark]},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                //console.log(response)
                if (statusValue[statusMark]==false || redefineMark){
                    //购物车全选box
                    document.getElementById("all_check_box").onclick=(function(){
                        if(this.checked==true){
                            for (index in product_unit_total){
                                eixst=document.getElementById("product_check_box_item"+index);
                                if(eixst){
                                    eixst.checked=true;
                                    product_unit_total[index]=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                                }
                            }
                            flushTotal();
                        }
                        else{
                            for (index in product_unit_total){
                                eixst=document.getElementById("product_check_box_item"+index);
                                if(eixst){
                                    eixst.checked=false;
                                    product_unit_total[index]=0;
                                }
                            }
                            flushTotal();
                        }
                    })
                    //购物车结算
                    document.getElementById("checkout_btn").onclick=(function(){
                        total_consum=product_unit_total["total"];
                        if (total_consum==0){
                            document.getElementById("hint_title").innerHTML="【System Prompt】";
                            document.getElementById("hint_content").innerHTML="您未选中任何商品，请购物后再结算。";
                            $("#hint_window_whole").toggle();
                            return 0;
                        }
                        _pp_money=getMoney();
                        if (total_consum>_pp_money){
                            document.getElementById("hint_title").innerHTML="【购物提示】";
                            document.getElementById("hint_content").innerHTML="抱歉，您存档【"+archiveID+"】内金钱值不足，请继续游戏获得金钱再来购买┭┮﹏┭┮";
                            $("#hint_window_whole").toggle();
                            return 0;
                        }

                        $("#promote_window_whole").toggle();
                        //console.log("结算拉");
                        document.getElementById("promote_title").innerHTML="【购物提示】";
                        document.getElementById("promote_content").innerHTML="您将消耗存档【"+archiveID+"】内的"+total_consum+"点金钱值购买购物车内所有物品。返回游戏后若点击【人生重来一次】按钮回退，该部分金钱将不会返还，物品保留，但可能因此进入破产剧情线。<br>是否确认购买?";
                        document.getElementById("promote_cancel_btn").onclick=(function(){
                            $("#promote_window_whole").toggle();
                        })
                        document.getElementById("promote_confirm_btn").onclick=(function(total_consum,response){
                            return function(){
                                changeMoney(total_consum);
                                $("#cart_over").toggle();
                                $("#promote_window_whole").toggle();
                                _product="";
                                j=0;
                                for (key in product_unit_total){
                                    eixst=document.getElementById("shopping_cart_text_item"+key);
                                    if (eixst && product_unit_total[key]!=0){
                                        amount=$("#shopping_cart_text_item"+key).val();
                                        if (j==0){
                                            _product=_product+amount+"件"+response["title"+key];
                                        } else _product=_product+","+amount+"件"+ response["title"+key];
                                        addProductAmount(amount,response["title"+key]);
                                        element = document.getElementById("add_card_item"+key);
                                        element.parentNode.removeChild(element);
                                        delete product_unit_total[key];
                                        flushTotal();
                                        //console.log(_product);
                                        j=j+1;
                                    }
                                }
                                document.getElementById("hint_title").innerHTML="【谢谢光临】";
                                document.getElementById("hint_content").innerHTML="购买成功！存档【"+archiveID+"】新增物品："+_product+ "。<br>ps:返回游戏后若点击【人生重来一次】按钮回退，该部分金钱将不会返还，物品保留，但可能因此进入破产剧情线。";
                                $("#hint_window_whole").toggle();  
                            } 
                            
                        }(total_consum,response))
                    
                });
                //content 内部
                    objectAmount=parseInt(response["amount"]);
                    contentHtml=document.getElementById("content");
                    contentHtml.innerHTML=" ";
                    //出右侧list
                    /* document.getElementById("shopping_cart_icon_list").style.display="block"; */
                    list_container=document.createElement("div");
                    list_container.id="shopping_cart_icon_list";
                    list_container.className="fix_outer";
                    cart_inner=document.createElement("div");
                    cart_inner.className="shopping_cart_inner";
                    div1=document.createElement("div");
                    div1.className="store_card_name shopping_right_tag";
                    div1.id="shopping_cart_icon";
                    span1=document.createElement("span");
                    span1.className="glyphicon glyphicon-shopping-cart";
                    div1.appendChild(span1);
                    div1.onclick=(function(){
                        $("#cart_over").fadeToggle();
                        flushTotal();
                    })
                    div2=document.createElement("div");
                    div2.className="store_card_name shopping_right_tag";
                    div2.id="already_have_icon";
                    div2.onclick=(function(){
                        $("#own_window_whole").toggle();
                        $.ajax({
                            url: '/moment/wonder_archive/',
                            type: 'post',
                            data:{"own":"request"},
                            async:false,
                            csrfmiddlewaretoken:'{{ csrf_token }}',
                            success: function (res) {
                                res=JSON.parse(res);
                                outcontain=document.getElementById("own_window_content");
                                outcontain.innerHTML="";
                                //console.log("exist?"+outcontain);
                                for (owni=0;owni<parseInt(res["amount"]);owni++){
                                    ownSection=document.createElement("div");
                                    ownSection.className="own_section";
                                    imgC=document.createElement("div");
                                    imgC.className="own_img_container";
                                    img=document.createElement("img");
                                    img.src=res["image"+owni];
                                    img.className="own_img";
                                    imgC.appendChild(img);
                                    ownText=document.createElement("div");
                                    ownText.className="own_text";
                                    title=document.createElement("div");
                                    title.innerHTML=res["title"+owni];
                                    amountC=document.createElement("div");
                                    amountC.className="own_amount";
                                    span1=document.createElement("span");
                                    span1.className="glyphicon glyphicon-stats";
                                    span2=document.createElement("span");
                                    span2.innerHTML=" 已拥有数量：";
                                    span3=document.createElement("span");
                                    span3.id="own_amount_inner"+owni;
                                    span3.innerHTML=res["amount"+owni];
                                    amountC.appendChild(span1);
                                    amountC.appendChild(span2);
                                    amountC.appendChild(span3);
                                    ownText.appendChild(title);
                                    ownText.appendChild(amountC);
                                    btnList=document.createElement("div");
                                    btnList.className="own_btn_list";
                                    btnSec=document.createElement("section");
                                    button1=document.createElement("button");
                                    button1.className='dashed thin own_btn';
                                    button1.id="own_illustration_btn"+owni;
                                    button1.innerHTML="详情";
                                    button1.onclick=(function(arg,res){
                                        return function(){
                                            document.getElementById("hint_title").innerHTML="【"+res["title"+arg]+"】";
                                            document.getElementById("hint_img").src=res["image"+arg];
                                            document.getElementById("hint_content").innerHTML=res["illustration"+arg]+"<br>单价："+res["money"+arg];
                                            $("#hint_window_whole").toggle();
                                        }
                                    }(owni,res))
                                    button2=document.createElement("button");
                                    button2.className='dashed thin own_btn';
                                    button2.id="own_use_btn"+owni;
                                    button2.innerHTML="使用";
                                    button2.onclick=(function(arg,res){
                                        return function(){
                                            if(parseInt(res["amount"+arg])>=1){
                                                $("#promote_window_whole").toggle();
                                                document.getElementById("promote_title").innerHTML="【使用提示】";
                                                document.getElementById("promote_content").innerHTML="您将使用存档【"+archiveID+"】内的"+res["title"+arg]+"。返回游戏后若点击【人生重来一次】按钮回退，该物品将不会返还，使用物品后得到的附属物保留。<br>是否确认使用?";
                                                document.getElementById("promote_cancel_btn").onclick=(function(){
                                                    $("#promote_window_whole").toggle();
                                                })
                                                document.getElementById("promote_confirm_btn").onclick=(function(){
                                                    $("#own_window_whole").toggle();
                                                    $("#promote_window_whole").toggle();
                                                    cardType=res["type"+arg];
                                                    cardTitle=res["title"+arg];
                                                    //console.log(cardType)
                                                    useProduct(cardType,cardTitle);
                                                });
                                            }
                                        }
                                    }(owni,res))
                                    btnSec.appendChild(button1);
                                    btnSec.appendChild(button2);
                                    btnList.appendChild(btnSec);
                                    ownSection.appendChild(imgC);
                                    ownSection.appendChild(ownText);
                                    ownSection.appendChild(btnList);
                                    outcontain.appendChild(ownSection);
                                    //console.log(document.getElementById("own_window_content").innerHTML)
                                }
                            
                            },
                            error:function () {
                                console.log("faillllllll：");
                            }
                        })
                        $("own_window_whole").toggle();
                    })
                    span2=document.createElement("span");
                    span2.className="glyphicon glyphicon-briefcase";
                    div2.appendChild(span2);
                    div3=document.createElement("div");
                    div3.className="store_card_name shopping_right_tag";
                    div3.id="lucky_draw_icon";
                    div3.onclick=(function(){
                        date=new Date();
                        dateString=date.getFullYear().toString()+"@"+(date.getMonth()+1).toString()+"@"+date.getDate().toString();
                        remainTimes=getDailyValue("lucky_draw",dateString,0);
                        //console.log("remianTimes:"+remainTimes);
                        $("#promote_window_whole").toggle();
                        document.getElementById("promote_title").innerHTML="【Lucky Draw 提示】";
                        document.getElementById("promote_content").innerHTML="你好哇，欢迎来到图鉴抽奖区，今日全游戏剩余免费抽卡次数：【"+remainTimes+"】。抽取物品将存入存档【"+archiveID+"】内，您可通过导航条【存档】键切换存档。<br>是否使用一次免费机会抽卡?";
                        document.getElementById("promote_cancel_btn").onclick=(function(){
                            $("#promote_window_whole").toggle();
                        })
                        document.getElementById("promote_confirm_btn").onclick=(function(){
                            $("#promote_window_whole").toggle();
                            if (remainTimes>0){
                                resRemain=getDailyValue("lucky_draw",dateString,1);
                                useProduct("normal","none@0");
                            }
                            else{
                                document.getElementById("hint_title").innerHTML="【Lucky Draw 提示】";
                                document.getElementById("hint_content").innerHTML="对不起，您今日抽卡次数不足，明天再来。或可选择和PP在一起获得无限次抽卡机会( •̀ ω •́ )y";
                                $("#hint_window_whole").toggle();
                            }
                            
                        })
                    })
                    span3=document.createElement("span");
                    span3.className="glyphicon glyphicon-screenshot";
                    div3.appendChild(span3);
                    cart_inner.appendChild(div1);
                    cart_inner.appendChild(div2);
                    cart_inner.appendChild(div3);
                    list_container.appendChild(cart_inner);
                    contentHtml.appendChild(list_container);
                    for(i=1;i<=objectAmount;i++){
                        shoppingCart=document.createElement("div");
                        shoppingCart.className="shopping_cart";
                        shoppingCartImg=document.createElement("div");
                        shoppingCartImg.className="shopping_cart_img";
                        imgFigure=document.createElement("img");
                        imgFigure.src=response["image"+i];
                        imgFigure.className="shopping_cart_img_url"
                        shoppingCartImg.appendChild(imgFigure);
                        content=document.createElement("div");
                        content.className="shopping_cart_content";
                        p1=document.createElement("p");
                        p1.innerHTML=response["title"+i];
                        p1.className="shopping_cart_title";
                        p2=document.createElement("p");
                        p2.className="shopping_cart_illustration";
                        p2.innerHTML=response["illustration"+i];
                        p3=document.createElement("p");
                        p3.className="shopping_cart_money";
                        i1=document.createElement("i");
                        i1.className="glyphicon glyphicon-piggy-bank cart_piggy_icon";
                        span1=document.createElement("span");
                        span1.innerHTML=response["money"+i];
                        p3.appendChild(i1);
                        p3.appendChild(span1);
                        quantityInput=document.createElement("div");
                        quantityInput.className="quantity-input";
                        input1=document.createElement("input");
                        input1.className="shopping_cart_btn minus_btn";
                        input1.type="button";
                        input1.value="-";
                        input1.onclick=(function(){
                                var val = parseInt($(this).next('input').val());
                                if (val !== 0) {
                                    $(this).next('input').val(val - 1).change();
                                }
                        });
                        input2=document.createElement("input");
                        input2.className="shopping_cart_text";
                        input2.type="text";
                        input2.value="1";
                        input2.id="shopping_cart_text"+i;
                        input3=document.createElement("input");
                        input3.className="shopping_cart_btn plus_btn";
                        input3.type="button";
                        input3.value="+";
                        input3.onclick=(function(){
                                var val = parseInt($(this).prev('input').val());
                                $(this).prev('input').val(val + 1).change();
                        });
                        div1=document.createElement("div");
                        section1=document.createElement("section");
                        button1=document.createElement("button");
                        button1.className="dashed thin add_cart_btn";
                        button1.id="shopping_cart_add_cart"+i;
                        button1.innerHTML="Add to cart";
                        button1.onclick=(function(arg,res){
                            return function(){
                                index=arg;
                                response=res;
                                flushCartItem(index,response);
                                unitTotal=document.getElementById("product_unit_total_money_item"+index);
                                unitTotal.innerHTML=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                                product_unit_total[index]=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                                flushTotal();
                            }
                        }(i,response));
                        button2=document.createElement("button");
                        button2.className="dashed thin add_cart_btn";
                        button2.id="shopping_cart_buy"+i;
                        button2.innerHTML="Buy now";
                        button2.onclick=(function(arg,res){
                            return function(){
                                _index=arg;
                                response=res;
                                var val = parseInt($("#shopping_cart_text"+_index).val());
                                total_consum=parseInt(response["money"+_index])*val;
                                _pp_money=getMoney();
                                if (_pp_money<total_consum){
                                    document.getElementById("hint_title").innerHTML="【购物提示】";
                                    document.getElementById("hint_content").innerHTML="抱歉，您存档【"+archiveID+"】内金钱值不足，请继续游戏获得金钱再来购买┭┮﹏┭┮";
                                    $("#hint_window_whole").toggle();
                                }
                                else{
                                    $("#promote_window_whole").toggle();
                                    document.getElementById("promote_title").innerHTML="【购物提示】";
                                    document.getElementById("promote_content").innerHTML="您将消耗存档【"+archiveID+"】内的"+total_consum+"点金钱值购买"+val+"件【"+response["title"+_index]+ "】。返回游戏后若点击【人生重来一次】按钮回退，该部分金钱将不会返还，物品保留，但可能因此进入破产剧情线。<br>是否确认购买?";
                                    document.getElementById("promote_cancel_btn").onclick=(function(){
                                        $("#promote_window_whole").toggle();
                                    })
                                    document.getElementById("promote_confirm_btn").onclick=(function(val,_index,total_consum,response){
                                        return function(){
                                            changeMoney(total_consum);
                                            addProductAmount(val,response["title"+_index]);
                                            $("#promote_window_whole").toggle();
                                            document.getElementById("hint_title").innerHTML="【谢谢光临】";
                                            document.getElementById("hint_content").innerHTML="购买成功！存档【"+archiveID+"】新增物品："+response["title"+_index]+ "。<br>ps:返回游戏后若点击【人生重来一次】按钮回退，该部分金钱将不会返还，物品保留，但可能因此进入破产剧情线。";
                                            $("#hint_window_whole").toggle();
                                        }
                                    }(val,_index,total_consum,response))
                                }
                            }
                        }(i,response));
                        section1.appendChild(button1);
                        section1.appendChild(button2);
                        div1.appendChild(section1);
                        quantityInput.appendChild(input1);
                        quantityInput.appendChild(input2);
                        quantityInput.appendChild(input3);
                        quantityInput.appendChild(div1);
                        content.appendChild(p1);
                        content.appendChild(p2);
                        content.appendChild(p3);
                        content.appendChild(quantityInput);
                        shoppingCart.appendChild(shoppingCartImg);
                        shoppingCart.appendChild(content);
                        contentHtml.appendChild(shoppingCart);
                    }
                }
                //change stastus
                statusValue["a"]=false;
                statusValue["p"]=false;
                statusValue["s"]=true;
                statusValue["g"]=false;
                statusValue["c"]=false;
            },
            error:function () {
                console.log("failed");
            }
        })
    }
    var product_unit_total={initial:0,total:0};
    function flushCartItem(index,response){
/*         console.log("flush cart item and index and response is:");
        console.log(response);
        console.log(response); */
        eixst=document.getElementById("add_card_item"+index);
        if(eixst){
            //console.log("item exist");
            var val = parseInt($("#shopping_cart_text"+index).val());
            //console.log("Add to cart的个数："+val);
            initval = parseInt($("#shopping_cart_text_item"+index).val());
            //console.log("原本个数"+initval);
            $("#shopping_cart_text_item"+index).val(val + initval).change();
            unitTotal=document.getElementById("product_unit_total_money_item"+index);
            unitTotal.innerHTML=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
            checkele=document.getElementById("product_check_box_item"+index);
            if (checkele.checked==true){
                product_unit_total[index]=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                flushTotal();
                //console.log("checked");
            }
            else{
                product_unit_total[index]=0;
                flushTotal();
                //console.log("unchecked");
            }
        }
        else{
        product_section_container=document.getElementById("product_section_container");
        div1=document.createElement("div");
        div1.className="add_card_title border_cart";
        div1.id="add_card_item"+index;
        check=document.createElement("input");
        check.className="product_check_box_item";
        check.type="checkbox";
        check.id="product_check_box_item"+index;
        check.checked=true;
        check.onclick=(function(){
            if (this.checked==true){
                product_unit_total[index]=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                flushTotal();
                //console.log("checked");
            }
            else{
                product_unit_total[index]=0;
                flushTotal();
                //console.log("unchecked");
            }
        })
        title=document.createElement("div");
        title.className="product_name add_cart_height_cal";
        title.innerHTML=response["title"+index];
        number=document.createElement("div");
        number.className="product_number";
        quanti=document.createElement("div");
        quanti.className="add_cart_height_cal cart_quantity";
        input1=document.createElement("input");
        input1.className="shopping_cart_btn minus_btn";
        input1.type="button";
        input1.value="-";
        input1.onclick=(function(arg,response){
            return function(){
                index=arg;
                var val = parseInt($(this).next('input').val());
                if (val !== 0) {
                    $(this).next('input').val(val - 1).change();
                }
                unitTotal=document.getElementById("product_unit_total_money_item"+index);
                unitTotal.innerHTML=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                product_unit_total[index]=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
                flushTotal();
            }
        }(index,response));
        input2=document.createElement("input");
        input2.className="shopping_cart_text";
        input2.type="text";
        val = parseInt($("#shopping_cart_text"+index).val());
        input2.value=val;
        input2.id="shopping_cart_text_item"+index;
        input3=document.createElement("input");
        input3.className="shopping_cart_btn plus_btn";
        input3.type="button";
        input3.value="+";
        input3.onclick=(function(arg,response){
            return function(){
                _index=arg;
                var val = parseInt($(this).prev('input').val());
                $(this).prev('input').val(val + 1).change();
                unitTotal=document.getElementById("product_unit_total_money_item"+_index);
                unitTotal.innerHTML=parseInt(response["money"+_index])*($("#shopping_cart_text_item"+_index).val());
                product_unit_total[_index]=parseInt(response["money"+_index])*($("#shopping_cart_text_item"+_index).val());
                flushTotal();
            }
        }(index,response));
        quanti.appendChild(input1);
        quanti.appendChild(input2);
        quanti.appendChild(input3);
        number.appendChild(quanti);
        unitMoney=document.createElement("div");
        unitMoney.className="product_unit_money add_cart_height_cal";
        unitMoney.innerHTML=response["money"+index];
        total=document.createElement("div");
        total.id="product_unit_total_money_item"+index;
        total.className="product_unit_total_money add_cart_height_cal";
        total.innerHTML=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
        cancel=document.createElement("div");
        cancel.className="product_cancel add_cart_height_cal";
        cancel_icon=document.createElement("i");
        cancel_icon.className="glyphicon glyphicon-remove";
        cancel.appendChild(cancel_icon);
        cancel.onclick=(function(arg){
            return function(){
                index=arg;
                element = document.getElementById("add_card_item"+index);
                element.parentNode.removeChild(element);
                delete product_unit_total[index];
                flushTotal();
            }
        }(index));
        div1.appendChild(check);
        div1.appendChild(title);
        div1.appendChild(number);
        div1.appendChild(unitMoney);
        div1.appendChild(total);
        div1.appendChild(cancel);
        product_section_container.appendChild(div1);
        checkele=document.getElementById("product_check_box_item"+index);
        if (checkele.checked==true){
            product_unit_total[index]=parseInt(response["money"+index])*($("#shopping_cart_text_item"+index).val());
            flushTotal();
            //console.log("checked");
        }
        else{
            product_unit_total[index]=0;
            flushTotal();
            //console.log("unchecked");
        }
        }
        //flush total   
    }
    function flushTotal(){
        _total=0;
        for(key in product_unit_total){
            if(key!="total")_total=_total+product_unit_total[key];
        }
        document.getElementById("product_total_money").innerHTML=_total;
        product_unit_total["total"]=_total;
        //console.log(product_unit_total);
    }
    function changeMoney(arg){
        //Human_repo["PP"].DelMoney(arg);
        for (j=0;j<Record.length;j++){
            Record[j]["PPMoney"]=Record[j]["PPMoney"]-arg;
        }
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data:{del_money:-arg},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                //console.log("changeMoney scuss shopping!")
                flushHintCircle();
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
    }
    function addProductAmount(arg,title){
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data:{add_shopping_amount:arg,product_title:title},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                //console.log("product amount change scuss shopping!")
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
    }
    function delProductAmount(arg,title){
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data:{del_shopping_amount:arg,product_title:title},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                //console.log("product amount change scuss shopping!")
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
    }

    //得到当前 money
    function getMoney(){
        var _money;
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data:{"require":"money"},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                _money=parseInt(JSON.parse(res).money);
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
        return _money;              
    }
    function useProduct(nedtype,title){
        $.ajax({
            url: '/moment/lucky_draw/',
            type: 'post',
            data:{type:nedtype,title:title},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                prores=JSON.parse(res);
                switch(prores["result"]){
                    case "card":
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
                            $(".overlay_whole_SC").addClass("is-on_process");
                            $("#new_tag").toggle();
                            $("#flip_icon").toggle();
                            document.getElementById("SC_over_all_icon").style.display="table-cell";
                            document.getElementById("SC_over_all_icon").onclick=(function(){
                                $(".overlay_whole_SC").removeClass("is-on_process");
                                $("#flip_icon").toggle();
                                $("#new_tag").toggle();
                                document.getElementById("SC_over_all_icon").style.display="none";
                            })
                            document.getElementById("hint_title").innerHTML="【抽奖结果】";
                            document.getElementById("hint_content").innerHTML="恭喜您获得1张"+prores["rank"]+"级别新图鉴“"+prores["title"]+"”，将存入存档【"+archiveID+"】，可在【图鉴】页面查看。";
                            $("#hint_window_whole").toggle();
                    break;
                    case "money":
                            $(".overlay_whole_SC").addClass("is-on_process");
                            document.getElementById("new_money_value").innerHTML=prores["money"];
                            //Human_repo["PP"].AddMoney(parseInt(prores["money"]));
                            for (j=0;j<Record.length;j++){
                                Record[j]["PPMoney"]=Record[j]["PPMoney"]+parseInt(prores["money"]);
                            }
                            flushHintCircle();
                            $("#new_money_over").toggle();
                            document.getElementById("SC_over_all_icon").style.display="table-cell";
                            document.getElementById("SC_over_all_icon").onclick=(function(){
                                $(".overlay_whole_SC").removeClass("is-on_process");
                                $("#new_money_over").toggle();
                                document.getElementById("SC_over_all_icon").style.display="none";
                            })
                            document.getElementById("hint_title").innerHTML="【抽奖结果】";
                            document.getElementById("hint_content").innerHTML="恭喜您获得"+prores["money"]+"点金钱值，将存入存档【"+archiveID+"】。";
                            $("#hint_window_whole").toggle();
                    break;
                    case "none":
                            document.getElementById("hint_title").innerHTML="【抽奖结果】";
                            document.getElementById("hint_content").innerHTML="很遗憾，您什么都没得到。";
                            $("#hint_window_whole").toggle();
                    break;
                }
                
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
    }
    function getDailyValue(title,time,arg){
        response={};
        $.ajax({
            url: '/moment/get_daily_value/',
            type: 'post',
            data:{title:title,time:time,arg:arg},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
            },
            error:function () {
                console.log("faillllllll：");
            }
        })
        if (arg==0){
            //console.log("fanhui"+parseInt(response["value"]));
            return parseInt(response["value"]);
        }
        else {
            return {"status":response["status"],"value":response["value"],"pre_value":response["pre_value"]};
        }
    }
    function flushStoreCard(){
        statusMark="c";
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data: {status_mark:statusMark, status_value:statusValue[statusMark]},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                //console.log(response)
                if (statusValue[statusMark]==false || redefineMark){
                    _name_repo=response["name_repo"].split("@");
                    amount_repo=response["amount_repo"].split("@");
                    contentHtml=document.getElementById("content");
                    contentHtml.innerHTML=" ";
                    var _src={};
                    var activeState={};
                    ourter_menu=document.createElement("div");
                    ourter_menu.className="outer";
                    innermenu=document.createElement("div");
                    innermenu.className="store_card_name_tag_list inner";
                    for (nameIndex=0;nameIndex<_name_repo.length;nameIndex++){
                        name_temp=_name_repo[nameIndex];
                        amount_temp=parseInt(amount_repo[nameIndex]);
                        //每一块图鉴的container
                        store_card_sec=document.createElement("div");
                        store_card_sec.className="store_card_section";
                        //右侧列表
                        _menu=document.createElement("div");
                        _menu.className="store_card_name store_card_name_right_tag";
                        _menu_a=document.createElement("a");
                        _menu_a.href="#store_card_"+_name_repo[nameIndex];
                        _menu_a.innerHTML=_name_repo[nameIndex];
                        _menu_a.href="#store_card_anchor_"+nameIndex;
                        _menu.appendChild(_menu_a);
                        innermenu.appendChild(_menu);
                        //name tag
                        name_tag=document.createElement("div");
                        name_tag.className='store_card_name store_card_name_top_tag';
                        name_tag.innerHTML=name_temp;
                        //anchor
                        name_anchor=document.createElement("div");
                        name_anchor_a=document.createElement("a");
                        name_anchor_a.name="store_card_anchor_"+nameIndex;
                        name_anchor.appendChild(name_anchor_a);
                        //先append上述
                        store_card_sec.appendChild(name_anchor);
                        store_card_sec.appendChild(name_tag);
                        //图鉴
                        for(i=0;i<amount_temp;i++){
                            activeState[nameIndex+"_"+i]= parseInt(response["active_state"+nameIndex+"_"+i]);
                            //console.log("active_state  "+activeState[nameIndex+"_"+i]);
                            storeCard=document.createElement("div");
                            storeCard.id="store_card"+nameIndex+"_"+i;
                            storeCard.className="store_card store_card_thumbnail";
                            storeCardImg=document.createElement("img");
                            storeCardImg.id="store_card_img"+nameIndex+"_"+i;
                            storeCardImg.className="store_card_img";
                            if (response["rank"+nameIndex+"_"+i]=="N")_src[nameIndex+"_"+i]="/static/moment/image/element/greemcard.png";
                            if (response["rank"+nameIndex+"_"+i]=="R")_src[nameIndex+"_"+i]="/static/moment/image/element/slivercard.png";
                            if (response["rank"+nameIndex+"_"+i]=="SR")_src[nameIndex+"_"+i]="/static/moment/image/element/goldcard.png";
                            if (response["rank"+nameIndex+"_"+i]=="SSR")_src[nameIndex+"_"+i]="/static/moment/image/element/purplecard.png";
                            storeCardImg.src=_src[nameIndex+"_"+i];
                            storeCardBack=document.createElement("img");
                            storeCardBack.id="store_card_background"+nameIndex+"_"+i;
                            storeCardBack.src=response["background"+nameIndex+"_"+i];
                            storeCardBack.className="store_card_background";
                            storeCardFigure=document.createElement("img");
                            storeCardFigure.src=response["figure"+nameIndex+"_"+i];
                            storeCardFigure.id="store_card_figure"+nameIndex+"_"+i;
                            storeCardFigure.className="store_card_figure";
                            if(!activeState[nameIndex+"_"+i]){
                                storeLock=document.createElement("img");
                                storeLock.className="store_card_lock";
                                storeLock.src="/static/moment/image/element/lock.png";
                            }
                            storeCard.onclick=(function(name_i,card_i,active,response){
                                return function(){
                                    _name_i=name_i;
                                    _card_i=card_i;
                                    _active=active;
                                    //console.log(" active_state="+activeState[_name_i+"_"+_card_i]);
                                    document.getElementById("store_card_background_over_all_front").src=response["background"+_name_i+"_"+_card_i];
                                    document.getElementById("store_card_background_over_all_back").src=response["background"+_name_i+"_"+_card_i];
                                    document.getElementById("store_card_img_front").src=_src[_name_i+"_"+_card_i];
                                    document.getElementById("store_card_img_back").src=_src[_name_i+"_"+_card_i];
                                    document.getElementById("card_back_title").innerHTML=response["title"+_name_i+"_"+_card_i];
                                    document.getElementById("store_card_figure").src=response["figure"+_name_i+"_"+_card_i];
                                    _starAmount=parseInt(response["star"+_name_i+"_"+_card_i]);
                                    for(j=1;j<=_starAmount;j++){
                                        document.getElementById("SCstar"+j).style.color="#FFCC22";
                                        if (!_active)document.getElementById("SCstar"+j).style.color="gray";
                                    }
                                    for(j=_starAmount+1;j<=5;j++){
                                        document.getElementById("SCstar"+j).style.color="gray";
                                    }
                                    document.getElementById("card_back_text").innerHTML=response["illustration"+_name_i+"_"+_card_i];
                                    if (!_active){
                                        //console.log("!!!")
                                        $("#store_card_background_over_all_front").addClass("gray_scale");
                                        $("#store_card_background_over_all_back").addClass("gray_scale");
                                        $("#store_card_img_front").addClass("gray_scale");
                                        $("#store_card_img_back").addClass("gray_scale");
                                        $("#store_card_figure").addClass("gray_scale");
                                    }
                                    if (_active){
                                        //console.log("????");
                                        $("#store_card_background_over_all_front").removeClass("gray_scale");
                                        $("#store_card_background_over_all_back").removeClass("gray_scale");
                                        $("#store_card_img_front").removeClass("gray_scale");
                                        $("#store_card_img_back").removeClass("gray_scale");
                                        $("#store_card_figure").removeClass("gray_scale");
                                        $(".overlay_whole_SC").addClass("is-on_process");
                                        $("#flip_icon").toggle();
                                        document.getElementById("SC_over_all_icon").style.display="table-cell";
                                        //关闭放大图鉴
                                        document.getElementById("SC_over_all_icon").onclick=(function(){
                                            $(".overlay_whole_SC").removeClass("is-on_process");
                                            $("#flip_icon").toggle();
                                            document.getElementById("SC_over_all_icon").style.display="none";
                                        })
                                    }
                                   /*  $(".overlay_whole").addClass("is-on_process");
                                    $("#flip_icon").toggle();
                                    document.getElementById("SC_over_all_icon").style.display="table-cell"; */
                                    
                                }
                            }(nameIndex,i,activeState[nameIndex+"_"+i],response));

                            storeCard.appendChild(storeCardImg);
                            storeCard.appendChild(storeCardBack);
                            storeCard.appendChild(storeCardFigure);
                            if(!activeState[nameIndex+"_"+i])storeCard.appendChild(storeLock); 
                            store_card_sec.appendChild(storeCard);
                    }
                        contentHtml.appendChild(store_card_sec);
                        for(i=0;i<amount_temp;i++){
                            if (!activeState[nameIndex+"_"+i]){
                                //console.log("gray scale"+activeState[nameIndex+"_"+i]);
                                $("#store_card_img"+nameIndex+"_"+i).addClass("gray_scale");
                                $("#store_card_figure"+nameIndex+"_"+i).addClass("gray_scale");
                                $("#store_card_background"+nameIndex+"_"+i).addClass("gray_scale");
                            }
                        }
                         
                   
                    }
                    ourter_menu.appendChild(innermenu);
                    contentHtml.insertBefore(ourter_menu,contentHtml.childNodes[0]);
                    
            }
                //change stastus
                statusValue["a"]=false;
                statusValue["p"]=false;
                statusValue["g"]=false;
                statusValue["s"]=false;
                statusValue["c"]=true;
                
            },
            error:function () {
                console.log("failed");
            }
        })
    }

    function flushNameCard(){
        //console.log("click")
        statusMark="a";
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data: {status_mark:statusMark, status_value:statusValue[statusMark]},
            async:false,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                //console.log(response)
                if (statusValue[statusMark]==false || redefineMark){
                    objectAmount=parseInt(response["amount"]);
                    contentHtml=document.getElementById("content");
                    contentHtml.innerHTML=" ";
                    if (objectAmount==0){
                        div=document.createElement("div");
                        div.className="none_data"
                        div.innerHTML=" No Record";
                        contentHtml.appendChild(div);
                    }
                    for(i=1;i<=objectAmount;i++){
                        nameCard=document.createElement("div");
                        nameCard.className="namecard";
                        h2=document.createElement("h2");
                        span1=document.createElement("span");
                        span1.className=("namecard_Chinese_name");
                        span1.id=response["name"+i]+"_name_card";
                        span1.innerHTML=response["full_name"+i];
                        span1.style.cursor="pointer";
                        span1.onclick=(function(arg,response){
                            return function(){
                                _index=arg;
                                //console.log(response["love"+_index]);
                                document.getElementById("ink_value_love").innerHTML=response["love"+_index];
                                document.getElementById("ink_value_money").innerHTML=response["money"+_index];
                                document.getElementById("ink_value_health").innerHTML=response["health"+_index];
                                document.getElementById("name_card_figure_img").src=response["image"+_index];
                                document.getElementById("intro_name").innerHTML=response["full_name"+_index];
                                document.getElementById("intro_illus").innerHTML=response["illustration"+_index];
                                document.getElementById("intro_background").src=response["background"+_index];
                                $("#intro_human").toggle();
                            }
                        }(i,response));
                        span2=document.createElement("span");
                        span2.className=("namecard_English_name");
                        span2.innerHTML="("+response["name"+i]+")"
                        h2.appendChild(span1);
                        h2.appendChild(span2);
                        h5=document.createElement("h5");
                        h5.className="namecard_introduction";
                        h5.innerHTML=response["position"+i];
                        hr=document.createElement("hr");
                        p=document.createElement("p");
                        p.className="namecard_illustration";
                        p.innerHTML=response["illustration"+i];
                        div1=document.createElement("div");
                        div2=document.createElement("div");
                        div1.className="namecard_circle namecard_circle1";
                        div2.className="namecard_circle namecard_circle2";
                        nameCard.appendChild(h2);
                        nameCard.appendChild(h5);
                        nameCard.appendChild(hr);
                        nameCard.appendChild(p);
                        nameCard.appendChild(div1);
                        nameCard.appendChild(div2);
                        contentHtml.appendChild(nameCard);
                        //console.log("sucess");
                    }
                }
                //change stastus
                statusValue["a"]=true;
                statusValue["p"]=false;
                statusValue["g"]=false;
                statusValue["s"]=false;
                statusValue["c"]=false;
            },
            error:function () {
                console.log("failed");
            }
        })
    }
    
    function flushGift(){
        statusMark="g";
        $.ajax({
            url: '/moment/wonder_archive/',
            type: 'post',
            data: {status_mark:statusMark, status_value:statusValue[statusMark]},
            async:true,
            csrfmiddlewaretoken:'{{ csrf_token }}',
            success: function (res) {
                response=JSON.parse(res);
                //console.log(res)
                if (statusValue[statusMark]==false || redefineMark){
                    objectAmount=parseInt(response["amount"]);
                    contentHtml=document.getElementById("content");
                    contentHtml.innerHTML="";
                    if (objectAmount==0){
                        div=document.createElement("div");
                        div.className="none_data"
                        div.innerHTML=" No Record";
                        contentHtml.appendChild(div);
                    }
                    for(i=1;i<=objectAmount;i++){
                        //console.log("generate GT")
                        blogcard=document.createElement("div");
                        blogcard.className="blog-card";
                        meta=document.createElement("div");
                        meta.className="meta";

                        photo=document.createElement("div");
                        photo.className="photo";
                        photo.style.backgroundImage="url("+response["pic_url"+i]+")";//！！！
                        ul=document.createElement("ul");
                        ul.className="details";
                        author=document.createElement("li");
                        author.className="author";
                        author.innerHTML=response["author"+i]; //!!!!
                        date=document.createElement("li");
                        date.className="date";
                        date.innerHTML=response["date"+i]; //!!!!
                        tags=document.createElement("li");
                        tags.className="tags";
                        ultag=document.createElement("ul");
                        litag1=document.createElement("li");
                        litag1.innerHTML=response["tag1"+i]+"/"; //!!
                        litag2=document.createElement("li");
                        litag2.innerHTML=response["tag2"+i]+"/"; //!!
                        litag3=document.createElement("li");
                        litag3.innerHTML=response["tag3"+i]; //!!

                        ultag.appendChild(litag1);
                        ultag.appendChild(litag2);
                        ultag.appendChild(litag3);
                        tags.appendChild(ultag);

                        ul.appendChild(author);
                        ul.appendChild(date);
                        ul.appendChild(tags);

                        meta.appendChild(photo);
                        meta.appendChild(ul);
                        description=document.createElement("div");
                        description.className="description";
                        h1d=document.createElement("h1");
                        h1d.innerHTML=response["title"+i]; //!!
                        h2d=document.createElement("h2");
                        h2d.innerHTML=response["subtitle"+i]; //!!
                        p1d=document.createElement("p");
                        p1d.innerHTML=response["illustration"+i]; //!!
/*                         p2d=document.createElement("p");
                        p2da=document.createElement("a");
                        p2da.className="read-more";
                        p2da.innerHTML="Read More";
                        p2d.appendChild(p2da); */
                        
                        description.appendChild(h1d);
                        description.appendChild(h2d);
                        description.appendChild(p1d);
                        //description.appendChild(p2d);

                        blogcard.appendChild(meta);
                        blogcard.appendChild(description);

                        contentHtml.appendChild(blogcard);
                    }
                }
                //change stastus
                statusValue["a"]=false;
                statusValue["p"]=false;
                statusValue["s"]=false;
                statusValue["g"]=true;
                statusValue["c"]=false;
            },
            error:function(){
                console.log("gift failed")
            }
        })
    }
})

   /*  if (response["flush_accept"]==1){
        objectAmount=parseInt(response["amount"]);
        contentHtml=document.getElementById("content");
        for(i=1;i<=objectAmount;i++){
            console.log(i);
            //异步刷新
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
    } */

    //带日期的thumbnail
 /*    var picCard=document.createElement('div');
    picCard.className="pic_card";
    var pic_card_example_1=document.createElement('div');
    pic_card_example_1.className="pic_card_example-1 card";
    var pic_card_wrapper=document.createElement('div');
    pic_card_wrapper.className="pic_card_wrapper";
    var pic_card_date=document.createElement('div');
    pic_card_date.className="pic_card_date";
    var pic_card_day=document.createElement('span');
    pic_card_day.className="pic_card_day";
    pic_card_day.innerHTML=response["pic_card_day"];
    var pic_card_month=document.createElement('span');
    pic_card_month.className="pic_card_month";
    pic_card_month.innerHTML=response["pic_card_month"];
    var pic_card_year=document.createElement('span');
    pic_card_year.className="pic_card_year";
    pic_card_year.innerHTML=response["pic_card_year"];
    var pic_card_data=document.createElement('div');
    pic_card_data.className="pic_card_data";
    var pic_card_content=document.createElement('div');
    pic_card_content.className="pic_card_content";
    var pic_card_author=document.createElement("span");
    pic_card_author.className="pic_card_author";
    pic_card_author.innerHTML=response["pic_card_author"]
    var pic_card_title=document.createElement("h1");
    pic_card_title.className="pic_card_title";
    pic_card_title.innerHTML=response["pic_card_title"]
    var pic_card_text=document.createElement("p");
    pic_card_text.className="pic_card_title";
    pic_card_text.innerHTML=response["pic_card_text"]

    pic_card_date.appendChild(pic_card_day);
    pic_card_date.appendChild(pic_card_month);
    pic_card_date.appendChild(pic_card_year);
    pic_card_content.appendChild(pic_card_author);
    pic_card_content.appendChild(pic_card_title);
    pic_card_content.appendChild(pic_card_text);
    pic_card_data.appendChild(pic_card_content);
    pic_card_wrapper.appendChild(pic_card_date);
    pic_card_wrapper.appendChild(pic_card_data);
    pic_card_example_1.appendChild(pic_card_wrapper);
    picCard.appendChild(pic_card_example_1); */