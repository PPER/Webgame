from django.urls import path

from . import views

app_name = 'moment'
urlpatterns = [
    path("",views.index_view,name="index_view"),
    path("logout_view/",views.logout_view,name="logout_view"),
    path("loading/",views.loading,name="loading"),
    path("story/",views.story,name="story"),
    path("basic_setting/",views.basic_setting,name="basic_setting"),
    #path("some_view/",views.some_view,name="some_view"),
    path("archive_GT_NC/",views.archive_GT_NC,name="archive_GT_NC"),
    path("galtry/",views.galtry,name="galtry"),
    path("story_navigation/",views.story_navigation,name="story_navigation"),
    path("process/",views.process,name="process"),
    path("chat_log/",views.chat_log,name="chat_log"),
    path("login_view/",views.login_view,name="login_view"),
    path("delete_person/",views.delete_person,name="delete_person"),
    path("register/",views.register,name="register"),
    path("verify/",views.verify,name="verify"),
    path("wonder_archive/",views.wonder_archive,name="wonder_archive"),
    path("lucky_draw/",views.lucky_draw,name="lucky_draw"),
    path("get_daily_value/",views.get_daily_value,name="get_daily_value"),
    path("pull_record/",views.pull_record,name="pull_record"),
    path("test_view/",views.test_view,name="test_view"),
    path('galcate/', views.galcate, name='galcate'),
    path('read_archive_id/',views.read_archive_id,name='read_archive_id'),
    path('define_archive_id/',views.define_archive_id,name='define_archive_id'),
    path('savearchive/',views.savearchive,name='savearchive'), #点击保存存档以后的处理
    
]
