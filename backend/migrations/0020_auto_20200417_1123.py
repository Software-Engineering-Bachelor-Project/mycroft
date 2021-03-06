# Generated by Django 3.0.3 on 2020-04-17 09:23

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):
    dependencies = [
        ('backend', '0019_filter_areas'),
    ]

    operations = [
        migrations.RenameField(
            model_name='filter',
            old_name='blacklisted_resolutions',
            new_name='whitelisted_resolutions',
        ),
        migrations.AlterField(
            model_name='filter',
            name='areas',
            field=models.ManyToManyField(default=None, to='backend.Area'),
        ),
        migrations.AlterField(
            model_name='filter',
            name='classes',
            field=models.ManyToManyField(default=None, to='backend.ObjectClass'),
        ),
        migrations.AlterField(
            model_name='filter',
            name='end_time',
            field=models.DateTimeField(default=datetime.datetime(9999, 12, 31, 23, 59, 59, 999999, tzinfo=utc),
                                       verbose_name='end time'),
        ),
        migrations.AlterField(
            model_name='filter',
            name='min_frame_rate',
            field=models.PositiveIntegerField(default=0, verbose_name='Minimum frame Rate'),
        ),
        migrations.AlterField(
            model_name='filter',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(1, 1, 1, 0, 0, tzinfo=utc), verbose_name='start time'),
        ),
    ]
