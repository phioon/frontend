# Generated by Django 3.1.3 on 2020-12-10 06:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0028_auto_20201210_0704'),
    ]

    operations = [
        migrations.AlterField(
            model_name='strategystats',
            name='rating',
            field=models.FloatField(default=None),
        ),
    ]
