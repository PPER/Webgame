# Generated by Django 2.2 on 2019-06-02 13:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('moment', '0044_auto_20190602_1927'),
    ]

    operations = [
        migrations.AlterField(
            model_name='story_file_status',
            name='file_dir',
            field=models.CharField(default='/static/moment/story/1', max_length=200),
        ),
        migrations.AlterField(
            model_name='story_file_status',
            name='last_sentence',
            field=models.CharField(blank=True, default='Click', max_length=200),
        ),
    ]
