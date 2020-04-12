# Generated by Django 3.0.3 on 2020-04-12 09:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_auto_20200408_2203'),
    ]

    operations = [
        migrations.CreateModel(
            name='Resolution',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('width', models.PositiveIntegerField()),
                ('height', models.PositiveIntegerField()),
            ],
        ),
        migrations.RemoveField(
            model_name='clip',
            name='height',
        ),
        migrations.RemoveField(
            model_name='clip',
            name='width',
        ),
    ]
