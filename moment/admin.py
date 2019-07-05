from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import Story_File_Status,Wonder_Archive_People,Wonder_Archive_GT,Chat_Log,Store_Card,Shopping_Cart,Shopping_Product,Daily_Story_File_Status,Basic_Setting,Current_Archive,Store_Card_Own
""" class Wonder_Archive_PeopleInline(admin.TabularInline):
    model = Wonder_Archive_People

class Story_File_StatusAdmin(admin.ModelAdmin):
    inlines = [
        Wonder_Archive_PeopleInline,
    ] """
""" admin.site.register(Story_File_Status,Story_File_StatusAdmin) """
admin.site.register(Story_File_Status)
admin.site.register(Wonder_Archive_People)
admin.site.register(Wonder_Archive_GT)
admin.site.register(Chat_Log)
admin.site.register(Store_Card)
admin.site.register(Shopping_Cart)
admin.site.register(Shopping_Product)
admin.site.register(Daily_Story_File_Status)
admin.site.register(Basic_Setting)
admin.site.register(Current_Archive)
admin.site.register(Store_Card_Own)