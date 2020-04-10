from unittest.mock import patch

import pytz
from django.conf import settings
from django.test import TestCase
from decimal import Decimal

# Import module
from django.utils import timezone

from backend.filter_module import *


class ModifyFilterTest(TestCase):
    def setUp(self) -> None:
        self.pid = dbw.create_project("Test project")
        self.fid = dbw.create_filter(self.pid)

    def test_simple_call(self):
        """
        Makes a simple call to the function.
        """
        data = {FILTER_ID: self.fid,
                START_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                END_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                ADD_CLASSES: ["monkey"],
                REMOVE_CLASSES: [],
                MIN_WIDTH: 200,
                MIN_HEIGHT: 100,
                MIN_FRAMERATE: 10
                }

        res = modify_filter(data)

        # Check that the filter in the db has been updated
        filter = dbw.get_filter_by_id(self.fid)
        self.assertEqual(filter.start_time, timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)))
        self.assertEqual(filter.end_time, timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)))
        self.assertEqual(filter.classes.first().object_class, "monkey")
        self.assertEqual(filter.min_width, 200)
        self.assertEqual(filter.min_height, 100)
        self.assertEqual(filter.min_frame_rate, 10)

        # Check response
        self.assertEqual(res, (200, {}))

    def test_bad_filter_id(self):
        """
        Test that an nonexistent fid causes the right response to be sent.
        """

        data = {FILTER_ID: 10,
                START_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                END_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                ADD_CLASSES: ["monkey"],
                REMOVE_CLASSES: [],
                MIN_WIDTH: 200,
                MIN_HEIGHT: 100,
                MIN_FRAMERATE: 10
                }

        res = modify_filter(data)
        self.assertEqual(res, (204, {}))


class GetClipsMatchingFilter(TestCase):

    def setUp(self) -> None:
        self.rid = dbw.create_root_folder(path="/home/user/", name="test_folder")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st1 = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et1 = self.st1 + timezone.timedelta(hours=1)
        self.st2 = self.st1 + timezone.timedelta(hours=2)
        self.et2 = self.st2 + timezone.timedelta(hours=1)

        dbw.create_clip(fid=self.rid, name="test_clip1", video_format="tvf",
                        start_time=self.st1, end_time=self.et1, latitude=self.lat,
                        longitude=self.lon, width=256, height=240, frame_rate=42.0)
        dbw.create_clip(fid=self.rid, name="test_clip2", video_format="tvf",
                        start_time=self.st2, end_time=self.et2, latitude=self.lat,
                        longitude=self.lon, width=256, height=240, frame_rate=42.0)
        self.pid = dbw.create_project(name="test_project")
        self.fid = dbw.create_filter(pid=self.pid)
        dbw.add_folder_to_project(self.fid, self.pid)

    def test_simple_call(self):
        """
        Makes a simple call to the function.
        """
        data = {FILTER_ID: 1,
                CAMERA_IDS: [1]
                }

        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: ['1', '2'], CAMERA_IDS: ['1']}))

    def test_time_filter(self):
        """
        Test filtering by time.
        """
        data = {FILTER_ID: 1,
                CAMERA_IDS: [1]
                }

        dbw.modify_filter(fid=self.fid, start_time=self.st2, end_time=self.et2, add_classes=None,
                          remove_classes=None, min_width=None, min_height=None,
                          min_frame_rate=None)
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: ['2'], CAMERA_IDS: ['1']}))
