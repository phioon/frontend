# Generated by Django 3.0.2 on 2020-06-23 18:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0029_usercustom_nationality'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subscription',
            name='id',
        ),
        migrations.AlterField(
            model_name='subscription',
            name='name',
            field=models.CharField(max_length=32, primary_key=True, serialize=False),
        ),
    ]
