# Generated by Django 3.1.3 on 2021-02-03 07:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0052_auto_20210203_0752'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='collection',
            name='index',
        ),
    ]
