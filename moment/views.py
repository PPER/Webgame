from django.http import HttpResponse, HttpResponseRedirect,JsonResponse
from django.shortcuts import get_object_or_404, render,redirect
from django.urls import reverse
from django.views import generic
from django.template import loader
from .models import Current_Archive,Test_Model,Wonder_Archive_People,Story_File_Status,Chat_Log,Wonder_Archive_GT,Store_Card,Shopping_Cart,Shopping_Product,Daily_Story_File_Status,Basic_Setting,Store_Card_Own
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt #一个de了很久的bug django的crsf防御机制 https://www.jianshu.com/p/a178f08d9389
import json,random,os,operator
from django import forms
from django.views.generic.edit import CreateView
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
'''
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from captcha.fields import CaptchaField
'''
# ...
NOWPATH=os.path.abspath('.')

""" 
class CaptchaTestForm(forms.Form):
    captcha = CaptchaField() """

""" class AjaxExampleForm(CreateView):
    template_name = "moment/login.html"
    form_class = AjaxForm

    def form_invalid(self, form):
        if self.request.is_ajax():
            to_json_response = dict()
            to_json_response['status'] = 0
            to_json_response['form_errors'] = form.errors

            to_json_response['new_cptch_key'] = CaptchaStore.generate_key()
            to_json_response['new_cptch_image'] = captcha_image_url(to_json_response['new_cptch_key'])

            return HttpResponse(json.dumps(to_json_response), content_type='application/json')

    def form_valid(self, form):
        form.save()
        if self.request.is_ajax():
            to_json_response = dict()
            to_json_response['status'] = 1

            to_json_response['new_cptch_key'] = CaptchaStore.generate_key()
            to_json_response['new_cptch_image'] = captcha_image_url(to_json_response['new_cptch_key'])

            return HttpResponse(json.dumps(to_json_response), content_type='application/json') """

""" def some_view(request):
    if request.POST:
        form = CaptchaTestForm(request.POST)

        # Validate the form: the captcha field will automatically
        # check the input
        if form.is_valid():
            human = True
            return HttpResponse(form.cleaned_data) # 这里没有建立模型，如果成功则直接打印
        else:
            return HttpResponse('validate error')
    else:
        form = CaptchaTestForm()

    return render('login1.html',locals())  """

@csrf_exempt
def verify(request):
    if request.method=="POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request,user)
            return HttpResponse( json.dumps( {"msg":"ok"} ) )
        else:
            return HttpResponse( json.dumps( {"msg":"invalid"} ) )
@csrf_exempt
def register(request):
    if request.method=="POST":
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST["email"]
        invite_code=request.POST["invite_code"]
        if User.objects.filter(username=username).exists():
            return HttpResponse( json.dumps( {"msg":"existed"} ) )
        if invite_code!="wsfw":
            return HttpResponse( json.dumps( {"msg":"invalid"} ) )
        user = User.objects.create_user(username, email, password)
        #创造一些初始object
        Basic_Setting.objects.create(user=user)
        archive_1=Story_File_Status.objects.create(user=user,archive_id=1)
        archive_2=Story_File_Status.objects.create(user=user,archive_id=2)
        archive_3=Story_File_Status.objects.create(user=user,archive_id=3)
        Daily_Story_File_Status.objects.create(user=user,title="lucky_draw")
        Wonder_Archive_People.objects.create(whether_user=1,story_file_status=archive_1,name="PP",full_name="Zoe")
        Wonder_Archive_People.objects.create(whether_user=1,story_file_status=archive_2,name="PP",full_name="Zoe")
        Wonder_Archive_People.objects.create(whether_user=1,story_file_status=archive_3,name="PP",full_name="Zoe")
        Current_Archive.objects.create(user=user,archive_id=3)
        login(request,user)
        return HttpResponse( json.dumps( {"msg":"ok"} ) )


#loading#
@login_required(login_url='/moment/login_view/')
def loading(request):
    return render(request,"moment/loading.html")

#剧情界面#
@login_required(login_url='/moment/login_view/')
def story(request):
    username=request.user.username
    response_data={}
    response_data["current_username"]=username
    template = loader.get_template('moment/story.html')
    return HttpResponse(template.render(response_data, request))

#获得存档id#
@csrf_exempt
def read_archive_id(request):
    user=request.user
    if request.method=="POST":
        archive = get_object_or_404(Current_Archive,user=user)
        data={}
        data["archive_id"]=archive.archive_id
        return HttpResponse( json.dumps(data) )

#更改存档id#
@csrf_exempt
def define_archive_id(request):
    user=request.user
    if request.method=="POST":
        current_archiveid=request.POST.get('archive_id')
        archive = get_object_or_404(Current_Archive,user=user)
        archive.archive_id=current_archiveid
        archive.save()
        return HttpResponse( json.dumps( {"archive":archive.archive_id} ) )

#成就页面#
def process(request):
    return render(request,"moment/process.html")

def galtry(request):
    return render(request,"moment/galtry.html")
#记录界面#
@login_required(login_url='/moment/login_view/')
def galcate(request):
    user =request.user
    whether_load = {}
    whether_load["current_username"]=user.username
    for load_index in range(3):
        archive = get_object_or_404(Story_File_Status, archive_id=load_index+1,user=user) #achive id 是从1~3
        active_value=archive.active_value
        if active_value==1:
            whether_load["whether_load"+"%d"%load_index]="LOAD"
            whether_load["whether_load_hint"+"%d"%load_index]=archive.date+" 存档"
            whether_load["whether_load_content"+"%d"%load_index]=archive.last_sentence
        if active_value==0:
            whether_load["whether_load"+"%d"%load_index]="CREAT"
            whether_load["whether_load_hint"+"%d"%load_index]="尚未有存档"
            whether_load["whether_load_content"+"%d"%load_index]="点击按钮开启故事"
    template = loader.get_template('moment/galcate.html')
    return HttpResponse(template.render(whether_load, request))

#创建一个record/init文件的函数写法，舍弃
#record/init文件的规则为，1~3行对应1~3 archive,如果已经active写yes,else 写no
""" def galcate(request):
    ##读取record init文件判断按钮应该是load还是create
    record_file=open(NOWPATH+'/moment/static/moment/record/init','r+')
    whether_load = {}
    load_index=0
    #读取文件第一个
    while True:
        file_line=record_file.readline()
        if not file_line:
            break
        if file_line[0]=="y":
            whether_load["whether_load"+"%d"%load_index]="LOAD"
            whether_load["whether_load_hint"+"%d"%load_index]="Please Press The Button To Load Previous Record"
        if file_line[0]=="n":
            whether_load["whether_load"+"%d"%load_index]="CREAT"
            whether_load["whether_load_hint"+"%d"%load_index]="Please Press The Button To Create New Record"
        load_index=load_index+1

    record_file.close()

    template = loader.get_template('moment/galcate.html')

    return HttpResponse(template.render(whether_load, request)) """
#存档记录#
@csrf_exempt
def savearchive(request):
    user=request.user
    if request.method=="POST":
        date=request.POST.get('date')
        last_sound_url=request.POST.get('lastSound')
        last_pic_url=request.POST.get('lastPic')
        last_figure_left_url=request.POST.get('lastFigureLeft')
        last_figure_right_url=request.POST.get('lastFigureRight')
        last_figure_center_url=request.POST.get('lastFigureCenter')
        last_sentence=request.POST.get('lastSentence')
        active_state=request.POST.get('activeState')
        current_archiveid=request.POST.get('currentArchiveId')
        current_sentence_number=request.POST.get('currentSentenceNumber')
        record_dir=request.POST.get('recordDir').strip() #不知道为什么这个长传字符串传递过来自带\r
        load_file=get_object_or_404(Story_File_Status,archive_id=current_archiveid,user=user)
        load_file.archive_id=current_archiveid
        load_file.active_value=active_state
        load_file.file_dir=record_dir
        load_file.sentence_number=current_sentence_number
        load_file.last_figure_left_url=last_figure_left_url
        load_file.last_figure_right_url=last_figure_right_url
        load_file.last_figure_center_url=last_figure_center_url
        load_file.last_pic_url=last_pic_url
        load_file.last_sentence=last_sentence
        load_file.last_sound_url=last_sound_url
        load_file.date=date
        load_file.save()
        people_repo=Wonder_Archive_People.objects.filter(story_file_status=load_file)
        for i in range(0,people_repo.count()):
            person_name=people_repo[i].name
            person=get_object_or_404(Wonder_Archive_People, name=person_name,story_file_status=load_file)
            person.health=request.POST.get(person_name+"Health")
            person.money=request.POST.get(person_name+"Money")
            person.love=request.POST.get(person_name+"Love")
            person.save()
        #改变active状态
        archive = get_object_or_404(Story_File_Status, archive_id=int(current_archiveid),user=user) #achive id 是从1~3
        archive.active_value=1
        archive.save()
        if request.POST.get('name'): #这个是property change 以后自动save一次
            person=get_object_or_404(Wonder_Archive_People, name=request.POST.get('name'),story_file_status=load_file)
            person.health_change=person.health_change+int(request.POST.get('health_change'))
            person.love_change=person.love_change+int(request.POST.get('love_change'))
            person.money_change=person.money_change+int(request.POST.get('money_change'))
            person.save()
            return HttpResponse(json.dumps({"msg":"update record success"}))
        return HttpResponse(json.dumps( {"message":"sucessfully saved"} ))
"""         hgg_health=request.POST.get('hggHealth')
        hgg_love=request.POST.get('hggLove')
        hgg_money=request.POST.get('hggMoney')
        pp_health=request.POST.get('ppHealth')
        pp_love=request.POST.get('ppLove')
        pp_money=request.POST.get('ppMoney') #文件末尾千万不要换行，不然js读取会出现问题
        hgg=get_object_or_404(Wonder_Archive_People, name="HGG",story_file_status_id=current_archiveid)
        hgg.health=hgg_health
        hgg.love=hgg_love
        hgg.money=hgg_money
        hgg.save()
        pp=get_object_or_404(Wonder_Archive_People, name="PP",story_file_status_id=current_archiveid)
        pp.health=pp_health
        pp.love=pp_love
        pp.money=pp_money
        pp.save() """
         

#状态改变时update
""" @csrf_exempt
def update_record(request):
    if request.method=="POST":
        person=get_object_or_404(Wonder_Archive_People, name=request.POST.get('name'))
        person.health=int(request.POST.get('current_health'))
        person.love=int(request.POST.get('current_love'))
        person.money=int(request.POST.get('current_money'))
        person.health_change=person.health_change+int(request.POST.get('health_change'))
        person.love_change=person.love_change+int(request.POST.get('love_change'))
        person.money_change=person.money_change+int(request.POST.get('money_change'))
        person.save()
        return HttpResponse(json.dumps({"msg":"success"})) """

#pull archive
@csrf_exempt
def pull_record(request):
    user=request.user
    if request.method=="POST" and request.POST.get("require")=="person_repo":
        response_data={}
        archive_id=get_object_or_404(Current_Archive,user=user).archive_id
        archive=get_object_or_404(Story_File_Status, archive_id=archive_id,user=user)
        people_repo=Wonder_Archive_People.objects.filter(story_file_status=archive)
        response_data["people_amount"]=people_repo.count()
        name_repo=[]
        for i in range(0,people_repo.count()):
            person_name=people_repo[i].name
            person=get_object_or_404(Wonder_Archive_People, name=person_name,story_file_status=archive)
            name_repo.append(person.name)
            response_data[person_name+"_health"]=person.health
            response_data[person_name+"_love"]=person.love
            response_data[person_name+"_money"]=person.money
        response_data["name_repo"]="@".join(name_repo)
        return HttpResponse(json.dumps(response_data))
    if request.method=="POST":
        archive_id=get_object_or_404(Current_Archive,user=user).archive_id
        archive=get_object_or_404(Story_File_Status, archive_id=archive_id,user=user)
        response_data={}
        response_data["active_state"]=archive.active_value
        response_data["current_sentence_number"]=archive.sentence_number
        response_data["story_dir"]=archive.file_dir.strip()
        response_data["last_pic_url"]=archive.last_pic_url
        response_data["last_figure_left_url"]=archive.last_figure_left_url
        response_data["last_figure_right_url"]=archive.last_figure_right_url
        response_data["last_figure_center_url"]=archive.last_figure_center_url
        response_data["last_sentence"]=archive.last_sentence
        response_data["last_sound_url"]=archive.last_sound_url
        people_repo=Wonder_Archive_People.objects.filter(story_file_status=archive)
        for i in range(0,people_repo.count()):
            person_name=people_repo[i].name
            person=get_object_or_404(Wonder_Archive_People, name=person_name,story_file_status=archive)
            response_data[person_name+"_health"]=person.health
            response_data[person_name+"_love"]=person.love
            response_data[person_name+"_money"]=person.money
        return HttpResponse(json.dumps(response_data))
"""         HGG = get_object_or_404(Wonder_Archive_People, name="HGG",story_file_status_id=archive_id)
        response_data["hgg_health"]=HGG.health
        response_data["hgg_money"]=HGG.money
        response_data["hgg_love"]=HGG.love
        PP= get_object_or_404(Wonder_Archive_People, name="PP",story_file_status_id=archive_id)
        response_data["pp_health"]=PP.health
        response_data["pp_money"]=PP.money
        response_data["pp_love"]=PP.love
        print(response_data) """

#wonderland界面异步刷新#
""" @csrf_exempt
def flush_choose():
    #选择ajax加载哪一个界面#
    choice=request.POST.get('flushChoice') #a是 archive; p是personal information; g 是gift
    if choice=='a':
        pic_path=request.POST.get('picPath')
        illustrate_name=request.POST.get('illusName')
        illus_file=open(NOWPATH+'/moment/static/moment/archive/illustrate'+illustrate_name,'r',encoding='UTF-8')
        illus_content=illus_file.read().split('\n')
        illus_file.close()
        response_data={}
        response_data['pic_name']=illus_content[0] #文件第一行是图鉴的名字
        response_data['illus_content']=illus_content[1] #文件第二行是图鉴说明
        response_data['person_health']=illus_content[2] #文件第三行是图鉴人的健康
        response_data['person_love']=illus_content[3] #文件第三行是图鉴人的love
        response_data['person_money']=illus_content[4] #文件第三行是图鉴人的money
        return HttpResponse(json.dumps( response_data ))
    if choice=='g':
        person = get_object_or_404() """

"""         flush_value = 0
        flush_accept_value=request.POST.get('status_value')
        if flush_accept_value==0:  #不要重复flush
            flush_value=1
        if flush_accept_value==1:
            flush_value=0
        response_data["flush_accept"]=flush_value """
@csrf_exempt
def wonder_archive(request):
    user=request.user
    if request.method=="POST":
        response_data={}
        archive_id = get_object_or_404(Current_Archive,user=user).archive_id
        story_file=get_object_or_404(Story_File_Status, archive_id=archive_id,user=user)
        if request.POST.get('status_mark')=="a":
            person_repo = Wonder_Archive_People.objects.filter(story_file_status=story_file,whether_user=0,active_state=1) 
            response_data["amount"]=person_repo.count() #不是user的数量#
            for i in range(1,response_data["amount"]+1):
                response_data["name"+str(i)]=person_repo[i-1].nick_name
                response_data["full_name"+str(i)]=person_repo[i-1].full_name
                response_data["position"+str(i)]=person_repo[i-1].position
                response_data["illustration"+str(i)]=person_repo[i-1].illustration
                response_data["health"+str(i)]=person_repo[i-1].health
                response_data["love"+str(i)]=person_repo[i-1].love
                response_data["money"+str(i)]=person_repo[i-1].money
                response_data["image"+str(i)]=person_repo[i-1].image
                response_data["background"+str(i)]=person_repo[i-1].background
            return HttpResponse(json.dumps(response_data))
        if request.POST.get('status_mark')=="g":
            GT_repo = Wonder_Archive_GT.objects.filter(story_file_status=story_file,active_state=1)
            response_data={}
            response_data["amount"]=GT_repo.count() #不是user的数量#
            for i in range(1,response_data["amount"]+1):
                response_data["pic_url"+str(i)]=GT_repo[i-1].pic_url
                response_data["subtitle"+str(i)]=GT_repo[i-1].subtitle
                response_data["illustration"+str(i)]=GT_repo[i-1].illustration
                response_data["tag1"+str(i)]=GT_repo[i-1].tag1
                response_data["tag2"+str(i)]=GT_repo[i-1].tag2
                response_data["tag3"+str(i)]=GT_repo[i-1].tag3
                response_data["author"+str(i)]=GT_repo[i-1].main_person.full_name
                response_data["date"+str(i)]=str(GT_repo[i-1].year)+"."+str(GT_repo[i-1].month)+"."+str(GT_repo[i-1].day)
                response_data["title"+str(i)]=GT_repo[i-1].title
                response_data["subtitle"+str(i)]=GT_repo[i-1].subtitle
                response_data["illustration"+str(i)]=GT_repo[i-1].illustration
            return HttpResponse(json.dumps(response_data))
        if request.POST.get('status_mark')=="c":
            response_data={}
            human_repo = Wonder_Archive_People.objects.filter(story_file_status=story_file,active_state=1)
            human_amount=human_repo.count()
            amount_temp=0
            response_data["name_repo"]=""
            response_data["amount_repo"]=""
            for i in range(0,human_amount):
                human_temp=human_repo[i]
                SC_repo_temp = Store_Card.objects.filter(name=human_temp.name).order_by("rank")
                if i!=0:
                    response_data["name_repo"]=response_data["name_repo"]+"@"+human_temp.full_name
                    response_data["amount_repo"]=response_data["amount_repo"]+"@"+str(SC_repo_temp.count())
                if i==0:
                    response_data["name_repo"]=human_temp.full_name
                    response_data["amount_repo"]=str(SC_repo_temp.count())
                for j in range(0,SC_repo_temp.count()):
                    own_store_card_temp,created= Store_Card_Own.objects.get_or_create(story_file_status=story_file,store_card=SC_repo_temp[j],person=human_temp)
                own_store_card_repo=Store_Card_Own.objects.filter(story_file_status=story_file,person=human_temp).order_by("-active_state","store_card__rank")
                for j in range(0,own_store_card_repo.count()):
                    response_data["active_state"+str(i)+"_"+str(j)]= own_store_card_repo[j].active_state
                    response_data["title"+str(i)+"_"+str(j)]=own_store_card_repo[j].store_card.title
                    response_data["star"+str(i)+"_"+str(j)]=own_store_card_repo[j].amount
                    response_data["rank"+str(i)+"_"+str(j)]=own_store_card_repo[j].store_card.rank
                    response_data["figure"+str(i)+"_"+str(j)]=own_store_card_repo[j].store_card.figure
                    response_data["background"+str(i)+"_"+str(j)]=own_store_card_repo[j].store_card.background
                    if own_store_card_repo[j].active_state !=0:
                        response_data["illustration"+str(i)+"_"+str(j)]=own_store_card_repo[j].store_card.illustration
            return HttpResponse(json.dumps(response_data))
        if request.POST.get('status_mark')=="s":
            response_data={}
            product_repo = Shopping_Cart.objects.all()
            response_data["amount"]=product_repo.count()
            for i in range(1,response_data["amount"]+1):
                response_data["image"+str(i)]=product_repo[i-1].image
                response_data["title"+str(i)]=product_repo[i-1].title
                response_data["illustration"+str(i)]=product_repo[i-1].illustration
                response_data["money"+str(i)]=product_repo[i-1].money
            return HttpResponse(json.dumps(response_data))
        if request.POST.get('del_money'):
            person=get_object_or_404(Wonder_Archive_People, name="PP",story_file_status=story_file)
            if (person.money+int(request.POST.get('del_money')))>=0:
                person.money_change=person.money_change+int(request.POST.get('del_money'))
                person.money=person.money+int(request.POST.get('del_money'))
                person.save()
                story_file.active_value=1
                story_file.save()
                return HttpResponse(json.dumps({"msg":"saved"}))
            else: 
                return HttpResponse(json.dumps({"msg":"not enough money fail"}))
        if request.POST.get('add_shopping_amount'):
            res_title=request.POST.get('product_title')
            res_add=int(request.POST.get('add_shopping_amount'))
            cart_goods=get_object_or_404(Shopping_Cart, title=res_title)
            story_file=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
            story_file.active_value=1
            story_file.save()
            product,created =Shopping_Product.objects.get_or_create(shopping_cart=cart_goods,story_file_status=story_file)
            product.amount=product.amount+res_add
            product.save()
            return HttpResponse(json.dumps({"msg":"saved"}))
        if request.POST.get('del_shopping_amount'):
            res_title=request.POST.get('product_title')
            res_del=int(request.POST.get('del_shopping_amount'))
            cart_goods=get_object_or_404(Shopping_Cart, title=res_title)
            story_file=get_object_or_404(Story_File_Status, archive_id=archive_id,user=user)
            product,created =Shopping_Product.objects.get_or_create(shopping_cart=cart_goods,story_file_status=story_file)
            product.amount=product.amount-res_del
            product.save()
            story_file.active_value=1
            story_file.save()
            return HttpResponse(json.dumps({"msg":"saved"}))
        if request.POST.get('own'):
            response_data={}
            own_repo=Shopping_Product.objects.filter(story_file_status=story_file,amount__gte=1)
            response_data["amount"]=own_repo.count()
            for i in range(0,own_repo.count()):
                product=own_repo[i].shopping_cart
                response_data["title"+str(i)]=product.title
                response_data["illustration"+str(i)]=product.illustration
                response_data["amount"+str(i)]=own_repo[i].amount
                response_data["image"+str(i)]=product.image
                response_data["money"+str(i)]=product.money
                response_data["type"+str(i)]=product.pro_type
            return HttpResponse(json.dumps(response_data))
        if request.POST.get('title'):
            res_store_card=get_object_or_404(Store_Card,title=request.POST.get('title'))
            res_person=Wonder_Archive_People.objects.get(name=res_store_card.name,story_file_status=story_file)
            res_store_card_own,created=Store_Card_Own.objects.get_or_create(store_card=res_store_card,story_file_status=story_file,person=res_person)
            res_store_card_own.active_state=1
            res_store_card_own.amount=res_store_card_own.amount+1
            res_store_card_own.save()
            response_data={}
            response_data["title"]=res_store_card.title
            response_data["illustration"]=res_store_card.illustration
            response_data["rank"]=res_store_card.rank
            response_data["figure"]=res_store_card.figure
            response_data["background"]=res_store_card.background
            response_data["star"]=res_store_card_own.amount
            return HttpResponse(json.dumps(response_data))
        if request.POST.get('require')=="money":
            pp_money=get_object_or_404(Wonder_Archive_People,story_file_status=story_file,name="PP")
            response_data={}
            response_data["money"]=pp_money.money
            return HttpResponse(json.dumps(response_data))

@csrf_exempt
def delete_person(request):
    user=request.user
    response_data={}
    archive_id = get_object_or_404(Current_Archive,user=user).archive_id
    archive=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
    if request.method=="POST":
        del_name=request.POST.get("name")
        person=Wonder_Archive_People.objects.get(name=del_name,story_file_status=archive)
        person.delete()
        return HttpResponse(json.dumps({"msg":"delete "+del_name}))

#lucky draw
@csrf_exempt
def lucky_draw(request):
    user=request.user
    response_data={}
    archive_id = get_object_or_404(Current_Archive,user=user).archive_id
    archive=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
    random_result=0
    def drawCard(draw_rank):
        nonlocal response_data
        person_repo=Wonder_Archive_People.objects.filter(story_file_status=archive,active_state=1)
        name_repo=[]
        for person in person_repo:
            name_repo.append(person.name)
        SC_repo= Store_Card.objects.filter(rank=draw_rank,name__in=name_repo)
        randon_seed=random.randint(0,SC_repo.count()-1)
        selected_one=SC_repo[randon_seed]
        selected_person=Wonder_Archive_People.objects.get(story_file_status=archive,name=selected_one.name)
        selected_own,created=Store_Card_Own.objects.get_or_create(story_file_status=archive,person=selected_person,store_card=selected_one)
        selected_own.active_state=1
        selected_own.amount=selected_own.amount+1
        selected_own.save()
        archive.active_value=1
        archive.save()
        response_data["result"]="card"
        response_data["rank"]=draw_rank
        response_data["star"]=selected_own.amount
        response_data["title"]=selected_one.title
        response_data["figure"]=selected_one.figure
        response_data["background"]=selected_one.background
        response_data["illustration"]=selected_one.illustration
    if request.method=="POST" and request.POST.get("type"):
        if request.POST.get("type")!="normal":
            res_title=request.POST.get("title")
            cart_goods=get_object_or_404(Shopping_Cart, title=res_title)
            product =get_object_or_404(Shopping_Product,shopping_cart=cart_goods,story_file_status=archive)
            product.amount=product.amount-1
            product.save()
            archive.active_value=1
            archive.save()
        res_type=request.POST.get("type").split("@")
        if res_type[0]=="card": #50% card,25%1-500金币，25%none
            random_result=random.randint(1,100)
            archive.active_value=1
            archive.save()
            if random_result<=50:
                drawCard(res_type[1])
            if 50<random_result and random_result<=75:
                response_data["result"]="money"
                response_data["money"]=random.randint(1,500)
                person=get_object_or_404(Wonder_Archive_People, name="PP",story_file_status=archive)
                person.money_change=person.money_change+int(response_data["money"])
                person.money=person.money+int(response_data["money"])
                person.save()
            if random_result>75 and random_result<=100:
                response_data["result"]="none"
        if res_type[0]=="money": #抽取0~x的金币值 where x:= money@x
            response_data["result"]="money"
            response_data["money"]=random.randint(0,int(res_type[1]))
            person=get_object_or_404(Wonder_Archive_People, name="PP",story_file_status=archive)
            person.money_change=person.money_change+int(response_data["money"])
            person.money=person.money+int(response_data["money"])
            person.save()
            archive.active_value=1
            archive.save()
        if res_type[0]=="normal":
            random_result=random.randint(1,100)
            if random_result<=50:
                drawCard("N")
            if 50<random_result and random_result<=75:
                drawCard("R")
            if random_result>75 and random_result<=90:
                drawCard("SR")
            if random_result>90 and random_result<=95:
                drawCard("SSR")
            if random_result>95 and random_result<=100:
                response_data["result"]="none"
    return HttpResponse(json.dumps(response_data))

#每天相关
@csrf_exempt
def get_daily_value(request):
    user=request.user
    archive_id = get_object_or_404(Current_Archive,user=user).archive_id
    archive=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
    response_data={}
    if request.method=="POST" and request.POST.get("title")=="lucky_draw":
        res_title=request.POST.get("title")
        res_time=request.POST.get("time").split("@")
        daily_obj=get_object_or_404(Daily_Story_File_Status,title=res_title,user=user)
        if int(request.POST.get("arg"))==0:
            if daily_obj.year!=res_time[0] or daily_obj.month!=res_time[1] or daily_obj.date!=res_time[2]:
                daily_obj.year=res_time[0]
                daily_obj.month=res_time[1]
                daily_obj.date=res_time[2]
                daily_obj.value=2
                daily_obj.save()
            response_data["value"]=daily_obj.value
            return HttpResponse(json.dumps(response_data))
        if daily_obj.year==res_time[0] and daily_obj.month==res_time[1] and daily_obj.date==res_time[2]:
            response_data["pre_value"]=daily_obj.value
            if daily_obj.value>0:
                daily_obj.value=daily_obj.value-int(request.POST.get("arg"))
                daily_obj.save()
                response_data["status"]="sucess"
            else: 
                response_data["status"]="fail"
        else:
            daily_obj.year=res_time[0]
            daily_obj.month=res_time[1]
            daily_obj.date=res_time[2]
            daily_obj.value=1
            daily_obj.save()
            response_data["prevalue"]=2
            response_data["value"]=daily_obj.value
        return HttpResponse(json.dumps(response_data))
#GT push
@csrf_exempt
def archive_GT_NC(request):
    user=request.user
    archive_id = get_object_or_404(Current_Archive, user=user).archive_id
    archive=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
    if request.method=="POST" and request.POST.get("archive_GT"):
        _GT_repo=request.POST.get('archive_GT').split("#")
        _GT_repo.pop(0)#第一个是无用的"GT" 为了js代码方便
        _GT_amount=len(_GT_repo)
        for i in range(0,_GT_amount):
            _GT=Wonder_Archive_GT.objects.get(story_file_status=archive,subtitle=_GT_repo[i])
            _GT.active_state=0 #如果已经active了，pop以后不要再产生记录 而是把state调成0
            _GT.save()
        return HttpResponse(json.dumps({"msg":"GT change sucess!"}))
    if request.method=="POST" and request.POST.get("archive_GT")==None and request.POST.get("subtitle"):
        main_person=get_object_or_404(Wonder_Archive_People,name=request.POST.get("main_person"),story_file_status=archive)
        obj, created = Wonder_Archive_GT.objects.get_or_create(story_file_status=archive,pic_url=request.POST.get("pic_url"),subtitle=request.POST.get("subtitle"),title=request.POST.get("title"),illustration=request.POST.get("illustration"),main_person=main_person,tag1=request.POST.get("tag1"),tag2=request.POST.get("tag2"),tag3=request.POST.get("tag3"))
        obj.year=request.POST.get("year")
        obj.day=request.POST.get("day")
        obj.month=request.POST.get("month")
        obj.active_state=1
        obj.save()
        return HttpResponse(json.dumps({"msg":"GT sucess!"}))
    if request.method=="POST" and request.POST.get("archive_NC"):
        _NC_repo=request.POST.get('archive_NC').split("#")
        _NC_repo.pop(0)#第一个是无用的"NC" 为了js代码方便
        _NC_amount=len(_NC_repo)
        for i in range(0,_NC_amount):
            _NC=Wonder_Archive_People.objects.get(story_file_status=archive,name=_NC_repo[i])
            _NC.active_state=0 #如果已经active了，pop以后不要再产生记录 而是把state调成0
            _NC.save()
        return HttpResponse(json.dumps({"msg":"NC change sucess!"}))
    if request.method=="POST" and request.POST.get("archive_NC")==None and request.POST.get("nick_name"):
        obj, created = Wonder_Archive_People.objects.get_or_create(story_file_status=archive,name=request.POST.get("name"))
        obj.nick_name =request.POST.get("nick_name")
        obj.full_name=request.POST.get("full_name")
        obj.position=request.POST.get("position")
        obj.health=int(request.POST.get("health"))
        obj.love=int(request.POST.get("love"))
        obj.money=int(request.POST.get("money"))
        obj.image=request.POST.get("image")
        obj.avatar=request.POST.get("avatar")
        obj.background=request.POST.get("background")
        obj.illustration=request.POST.get("illustration")
        obj.active_state=1
        obj.save()
        #创造chat_log
        person=Wonder_Archive_People.objects.get(story_file_status=archive,name=request.POST.get("name"))
        obj_chat, created_chat = Chat_Log.objects.get_or_create(story_file_status=archive,chat_person=person)
        response={}
        if created_chat:
            obj_chat.content="@ohello，我是"+person.full_name+"。很高兴认识你。"
            obj_chat.update_state=0
            response["msg"]="created"
        else :
            response["msg"]="existed"
        obj_chat.save()
        return HttpResponse(json.dumps(response))
    if request.method=="POST" and request.POST.get("name"):
        person_name=request.POST.get("name")
        response_data={}
        person=get_object_or_404(Wonder_Archive_People, name=person_name,story_file_status=archive)
        response_data["health"]=person.health
        response_data["love"]=person.love
        response_data["money"]=person.money
        response_data["image"]=person.image
        response_data["full_name"]=person.full_name
        response_data["illustration"]=person.illustration
        response_data["background"]=person.background
        response_data["avatar"]=person.avatar
        return HttpResponse(json.dumps(response_data))


@csrf_exempt
def story_navigation(request):
    user=request.user
    archive_id = get_object_or_404(Current_Archive,user=user).archive_id
    archive=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
    if request.method=="POST" and request.POST.get('health_change')==None:
        person = get_object_or_404(Wonder_Archive_People, name="PP",story_file_status=archive)
        response_data={}
        response_data["current_health"]=person.health-person.health_change
        response_data["current_love"]=person.love-person.love_change
        response_data["current_money"]=person.money-person.money_change
        response_data["health_change"]=person.health_change
        response_data["love_change"]=person.love_change
        response_data["money_change"]=person.money_change
        return HttpResponse(json.dumps(response_data))
    if request.method=="POST" and request.POST.get('health_change'):
        person = get_object_or_404(Wonder_Archive_People, name="PP",story_file_status=archive)
        person.health_change=request.POST.get('health_change')
        person.love_change=request.POST.get('love_change')
        person.money_change=request.POST.get('money_change')
        person.save()
        archive.active_state=1
        archive.save()
        return HttpResponse(json.dumps({"msg":"success"}))

#chat log
#草艹草艹·
@csrf_exempt
def chat_log(request):
    user=request.user
    archive_id = get_object_or_404(Current_Archive,user=user).archive_id
    archive=get_object_or_404(Story_File_Status,archive_id=archive_id,user=user)
    if request.method=="POST" and request.POST.get('chatLog')==None and request.POST.get('msg')==None:
        response_data={}
        contact_name=str(request.POST.get('contactName')).strip()
        chat_log=get_object_or_404(Chat_Log,story_file_status=archive,chat_person__name=contact_name)
        chat_content=chat_log.content
        chat_avatar=chat_log.chat_person.avatar
        response_data["chat_log"]=chat_content
        response_data["chat_pic"]=chat_avatar
        response_data["chat_full_name"]=chat_log.chat_person.full_name
        contact_repo = Wonder_Archive_People.objects.filter(story_file_status=archive,whether_user=0,active_state=1)
        amount=contact_repo.count()
        response_data["contact_amount"]=amount
        for i in range(0,amount):
            response_data["contact_name"+str(i)]=contact_repo[i].full_name
            response_data["contact_illustration"+str(i)]=contact_repo[i].illustration
            response_data["contact_position"+str(i)]=contact_repo[i].position
            response_data["contact_cue_name"+str(i)]=contact_repo[i].name
        return HttpResponse(json.dumps(response_data))
    if request.method=="POST" and request.POST.get('msg')=="flush_circle":
        response_data={}
        chat_log_repo=Chat_Log.objects.filter(story_file_status=archive,chat_person__active_state=1)
        response_data["amount"]=chat_log_repo.count()
        for i in range(0,response_data["amount"]):
            response_data["update_state"+str(i)]=chat_log_repo[i].update_state
            response_data["unread_name"+str(i)]=chat_log_repo[i].chat_person.name
        return HttpResponse(json.dumps(response_data))
    if request.method=="POST" and request.POST.get('msg')=="unread":
        contact_name=str(request.POST.get('contactName')).strip()
        chat_log=get_object_or_404(Chat_Log,story_file_status=archive,chat_person__name=contact_name)
        chat_log.update_state=0
        chat_log.save()
        return HttpResponse(json.dumps({"msg":"unread"}))
    if request.method=="POST" and request.POST.get('msg')=="read":
        contact_name=str(request.POST.get('contactName')).strip()
        chat_log=get_object_or_404(Chat_Log,story_file_status=archive,chat_person__name=contact_name)
        chat_log.update_state=1
        chat_log.save()
        return HttpResponse(json.dumps({"msg":"read"}))
    if request.method=="POST" and request.POST.get('msg')=="list":
        response_data={}
        contact_repo = Wonder_Archive_People.objects.filter(story_file_status=archive,whether_user=0,active_state=1)
        amount=contact_repo.count()
        response_data["contact_amount"]=amount
        for i in range(0,amount):
            response_data["contact_name"+str(i)]=contact_repo[i].full_name
            response_data["contact_illustration"+str(i)]=contact_repo[i].illustration
            response_data["contact_position"+str(i)]=contact_repo[i].position
            response_data["contact_cue_name"+str(i)]=contact_repo[i].name
        return HttpResponse(json.dumps(response_data))
    if request.method=="POST" and request.POST.get('msg')=="init":
        response_data={}
        chat_repo=Chat_Log.objects.filter(story_file_status=archive,chat_person__active_state=1)
        for i in range(0,chat_repo.count()):
            if i==0:
                response_data["chat_name"]=chat_repo[i].chat_person.name
            if i!=0:
                response_data["chat_name"]=response_data["chat_name"]+"@"+chat_repo[i].chat_person.name
        return HttpResponse(json.dumps(response_data))
    if request.method=="POST" and request.POST.get('chatLog') and request.POST.get('msg')==None:
        contact_name=str(request.POST.get('contactName')).strip()
        chat_content=request.POST.get('chatLog')
        chat_log=get_object_or_404(Chat_Log,story_file_status=archive,chat_person__name=contact_name)
        chat_log.content=chat_content
        chat_log.save()
        return HttpResponse(json.dumps({"msg":"save chatlog success"}))



@csrf_exempt
def basic_setting(request):
    user=request.user
    if request.method=="POST":
        setting_obj=get_object_or_404(Basic_Setting,user=user)
        if request.POST.get('character_interval'):
            setting_obj.character_interval=int(request.POST.get('character_interval'))
            setting_obj.paragraph_interval=int(request.POST.get('paragraph_interval'))
            setting_obj.save()
        response_data={}
        response_data["character_interval"]=setting_obj.character_interval
        response_data["paragraph_interval"]=setting_obj.paragraph_interval
        return HttpResponse(json.dumps(response_data))


#login
def login_view(request):
    return render(request,"moment/login.html")

@csrf_exempt
def logout_view(request):
    logout(request)
    return HttpResponse(json.dumps({"msg":"ok"}))
    # Redirect to a success page.

#login
def index_view(request):
    return render(request,"moment/index.html")

#test view#

def test_view(request):
    return render(request,"moment/try.html")
