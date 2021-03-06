# Generated by Django 3.0.3 on 2020-04-07 12:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_auto_20200406_1401'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='filter',
            name='cameras',
        ),
        migrations.AddField(
            model_name='filter',
            name='excluded_cameras',
            field=models.ManyToManyField(related_name='excluded_in_filter', to='backend.Camera'),
        ),
        migrations.AddField(
            model_name='filter',
            name='included_cameras',
            field=models.ManyToManyField(related_name='included_in_filter', to='backend.Camera'),
        ),
        migrations.AddField(
            model_name='filter',
            name='matching_cameras',
            field=models.ManyToManyField(related_name='filter', to='backend.Camera'),
        ),
    ]
