# Generated by Django 3.0.2 on 2020-03-29 12:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_transaction_asset_symbol'),
    ]

    operations = [
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('code', models.CharField(max_length=8, primary_key=True, serialize=False, verbose_name='ISO 4217 Code')),
                ('symbol', models.CharField(max_length=8, verbose_name='examples: US$, R$, A$, C$')),
                ('name', models.CharField(max_length=128)),
            ],
        ),
    ]
