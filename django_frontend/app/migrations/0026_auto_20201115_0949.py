# Generated by Django 3.1.3 on 2020-11-15 08:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0025_auto_20201114_0853'),
    ]

    operations = [
        migrations.RenameField(
            model_name='country',
            old_name='langId',
            new_name='locale',
        ),
    ]
