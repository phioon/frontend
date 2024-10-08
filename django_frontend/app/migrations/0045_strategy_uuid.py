# Generated by Django 3.1.3 on 2021-01-02 07:32

from django.db import migrations, models
import uuid


def create_uuid(apps, schema_editor):
    Strategy = apps.get_model('app', 'Strategy')
    for strategy in Strategy.objects.all():
        strategy.uuid = uuid.uuid4()
        strategy.save()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0044_auto_20210102_0711'),
    ]

    operations = [
        migrations.AddField(
            model_name='strategy',
            name='uuid',
            field=models.UUIDField(null=True),
        ),
        migrations.RunPython(create_uuid),
        migrations.AlterField(
            model_name='strategy',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
        )
    ]
