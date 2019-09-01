from django.db import models
import datetime
from django.utils import timezone
from django.contrib.auth.models import User

class Basic_Setting(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    character_interval=models.IntegerField(default=50)
    paragraph_interval=models.IntegerField(default=1000)
    def __str__(self):
        return "@"+self.user.username+"basic_setting"

class Current_Archive(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    archive_id = models.IntegerField(default=0)
    def __str__(self):
        return "@"+self.user.username+" curarchive:"+str(self.archive_id)

class Story_File_Status(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    date=models.CharField(max_length=50,default="Unknow Date")
    archive_id = models.IntegerField(default=1)
    active_value= models.IntegerField(default=0)
    file_dir=models.CharField(max_length=200,default="/static/moment/story/1")
    sentence_number=models.IntegerField(default=0)
    last_pic_url=models.CharField(max_length=200,default="",blank=True)
    last_figure_left_url=models.CharField(max_length=200,default="",blank=True)
    last_figure_right_url=models.CharField(max_length=200,default="",blank=True)
    last_figure_center_url=models.CharField(max_length=200,default="",blank=True)
    last_sound_url=models.CharField(max_length=200,default="",blank=True)
    last_sentence=models.CharField(max_length=200,blank=True,default="Click")
    def __str__(self):
        return "@"+self.user.username+" NO. "+str(self.archive_id)+" archive"

#和天相关的
class Daily_Story_File_Status(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    year=models.CharField(max_length=50,default="")
    month=models.CharField(max_length=50,default="")
    date=models.CharField(max_length=50,default="")
    value=models.IntegerField(default=2)
    title=models.CharField(max_length=50,default="")
    def __str__(self):
        return "[Daily_Story_File_Status] @"+self.user.username+ " title: "+self.title

class Wonder_Archive_People(models.Model):
    whether_user= models.IntegerField(default=0)
    active_state=models.IntegerField(default=1)
    name = models.CharField(max_length=30,default="")
    nick_name=models.CharField(max_length=50,default="这人很严肃，没有nickname")
    full_name = models.CharField(max_length=200,default="官方名字未知")
    position=models.CharField(max_length=50,default="NONE")
    health = models.IntegerField(default=100)
    love = models.IntegerField(default=100)
    money = models.IntegerField(default=100)
    health_change =models.IntegerField(default=0)
    love_change=models.IntegerField(default=0)
    money_change=models.IntegerField(default=0)
    image=models.CharField(max_length=200,default=" ",blank=True)
    avatar=models.CharField(max_length=200,default=" ",blank=True)
    background=models.CharField(max_length=200,default=" ",blank=True)
    illustration=models.CharField(max_length=200,default="神秘生物，暂无说明")
    story_file_status = models.ForeignKey(Story_File_Status, on_delete=models.CASCADE)
    def __str__(self):
        return "[Wonder_Archive_People]"+str(self.story_file_status.archive_id)+"person name: "+self.name+"  health:"+str(self.health)+"  love:"+str(self.love)+"  money:"+str(self.money)


class Wonder_Archive_GT(models.Model):
    active_state=models.IntegerField(default=0)
    pic_url=models.CharField(max_length=200)
    subtitle = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    illustration = models.CharField(max_length=500)
    day = models.CharField(max_length=20)
    month = models.CharField(max_length=20)
    year = models.CharField(max_length=20)
    main_person=models.ForeignKey(Wonder_Archive_People,on_delete=models.CASCADE,default=0)
    story_file_status = models.ForeignKey(Story_File_Status, on_delete=models.CASCADE,default=0)
    tag1= models.CharField(max_length=50)
    tag2= models.CharField(max_length=50)
    tag3= models.CharField(max_length=50)
    def __str__(self):
        return "[Wonder_Archive_GT]object name: "+self.subtitle

#图鉴
class Store_Card(models.Model):
    rank=models.CharField(max_length=5,default=" ")
    title=models.CharField(max_length=50,default=" ")
    illustration=models.CharField(max_length=200,default=" ")
    figure=models.CharField(max_length=200,default=" ")
    background=models.CharField(max_length=200,default=" ")
    name=models.CharField(max_length=200,default=" ")
    def __str__(self):
        return "[Store_Card]object title: "+self.name

class Store_Card_Own(models.Model):
    active_state=models.IntegerField(default=0)
    amount=models.IntegerField(default=0)
    story_file_status = models.ForeignKey(Story_File_Status, on_delete=models.CASCADE)
    store_card = models.ForeignKey(Store_Card, on_delete=models.CASCADE)
    person=models.ForeignKey(Wonder_Archive_People,on_delete=models.CASCADE)
    def __str__(self):
        return "[Store_Card] @"+self.story_file_status.user.username+" -archive: "+str(self.story_file_status.archive_id)

class Shopping_Cart(models.Model):
    image=models.CharField(max_length=200,default=" ")
    title=models.CharField(max_length=50,default=" ")
    illustration=models.CharField(max_length=200,default=" ")
    money=models.IntegerField(default=0)
    pro_type=models.CharField(max_length=50,default=" ") #card gift
    def __str__(self):
        return "[Shopping_Cart]object title: "+self.title
class Shopping_Product(models.Model):
    story_file_status = models.ForeignKey(Story_File_Status, on_delete=models.CASCADE,default=0)
    shopping_cart = models.ForeignKey(Shopping_Cart, on_delete=models.CASCADE,default=0)
    amount=models.IntegerField(default=0)
    def __str__(self):
        return "[Shopping_Cart]object title: "+self.shopping_cart.title

#聊天记录
class Chat_Log(models.Model):
    update_state=models.IntegerField(default=0)
    chat_person=models.ForeignKey(Wonder_Archive_People,on_delete=models.CASCADE)
    story_file_status = models.ForeignKey(Story_File_Status, on_delete=models.CASCADE)
    content=models.CharField(max_length=600,default="",blank=True) # "@".join(my_list) mylist.split("@")
    def __str__(self):
        return "[Chat_Log]chat person name: "+self.chat_person.name

class Test_Model(models.Model):
    name = models.CharField(max_length=200)
    number =  models.IntegerField(default=0)
    def __str__(self):
        return "object name: "+self.name

class Test_Model_2(models.Model):
    name = models.CharField(max_length=200)
    number =  models.IntegerField(default=0)
    def __str__(self):
        return "object name: "+self.name
