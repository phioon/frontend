# Generated by Django 3.0.2 on 2020-05-11 09:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0021_wallet_country'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='wallet',
            name='country',
        ),
    ]
