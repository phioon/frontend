# Generated by Django 3.1.3 on 2020-12-10 09:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0031_auto_20201210_0801'),
    ]

    operations = [
        migrations.RenameField(
            model_name='strategystats',
            old_name='usage_last_14_days',
            new_name='runs_last_14_days',
        ),
        migrations.RenameField(
            model_name='strategystats',
            old_name='usage_last_7_days',
            new_name='runs_last_7_days',
        ),
    ]
