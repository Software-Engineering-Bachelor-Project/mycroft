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
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st1 = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et1 = self.st1 + timezone.timedelta(hours=1)
        self.rid = dbw.create_root_folder(path="/home/user/", name="test_folder")
        dbw.create_clip(fid=self.rid, name="test_clip1", video_format="tvf",
                        start_time=self.st1, end_time=self.et1, latitude=self.lat,
                        longitude=self.lon, width=256, height=240, frame_rate=42.0)

    def test_simple_call(self):
        """
        Makes a simple call to the function.
        """
        data = {FILTER_ID: self.fid,
                START_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)).__str__(),
                END_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)).__str__(),
                CLASSES: ["monkey"],
                MIN_WIDTH: 200,
                MIN_HEIGHT: 100,
                MIN_FRAMERATE: 10,
                WHITELISTED_RESOLUTIONS: [{"height": 240, "width": 256}],
                }

        res = modify_filter(data)

        # Check that the filter in the db has been updated
        filter = dbw.get_filter_by_id(self.fid)
        self.assertEqual(filter.start_time, timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)))
        self.assertEqual(filter.end_time, timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)))
        self.assertEqual(filter.classes.first().object_class, "monkey")
        self.assertEqual(filter.min_frame_rate, 10)
        self.assertEqual(len(filter.whitelisted_resolutions.filter(height=240, width=256)), 1)

        # Check response
        self.assertEqual(res, (200, {}))

    def test_bad_filter_id(self):
        """
        Test that an nonexistent fid causes the right response to be sent.
        """

        data = {FILTER_ID: 10,
                START_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)).__str__(),
                END_TIME: timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)).__str__(),
                ADD_CLASSES: ["monkey"],
                REMOVE_CLASSES: [],
                MIN_WIDTH: 200,
                MIN_HEIGHT: 100,
                MIN_FRAMERATE: 10
                }

        res = modify_filter(data)
        self.assertEqual(res, (204, {}))


class GetClipsMatchingFilterTest(TestCase):

    def setUp(self) -> None:
        self.rid = dbw.create_root_folder(path="/home/user/", name="test_folder")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st1 = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et1 = self.st1 + timezone.timedelta(hours=1)
        self.st2 = self.st1 + timezone.timedelta(hours=2)
        self.et2 = self.st2 + timezone.timedelta(hours=1)

        self.cid1 = dbw.create_clip(fid=self.rid, name="test_clip1", video_format="tvf",
                                    start_time=self.st1, end_time=self.et1, latitude=self.lat,
                                    longitude=self.lon + 1, width=200, height=300, frame_rate=42.0)
        self.cid2 = dbw.create_clip(fid=self.rid, name="test_clip2", video_format="tvf",
                                    start_time=self.st2, end_time=self.et2, latitude=self.lat,
                                    longitude=self.lon, width=400, height=500, frame_rate=42.0)
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
        self.assertEqual(res, (200, {CLIP_IDS: [1, 2], CAMERA_IDS: [1, 2]}))

    def test_time_filter(self):
        """
        Test filtering by time.
        """
        data = {FILTER_ID: 1,
                CAMERA_IDS: [1]
                }

        dbw.modify_filter(fid=self.fid, start_time=self.st2, end_time=self.et2, min_frame_rate=None)
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: [2], CAMERA_IDS: [2]}))

    def test_quality_filter(self):
        """
        Test filtering by quality.
        """
        data = {FILTER_ID: 1}

        dbw.modify_filter(fid=self.fid, whitelisted_resolutions=[{HEIGHT: 500, WIDTH: 400}])
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: [2], CAMERA_IDS: [2]}))

    def test_location_filter(self):
        """
        Test filtering on location
        """
        data = {FILTER_ID: 1}

        area = dbw.create_area(self.lat, self.lon, Decimal(value="0.5"))
        dbw.modify_filter(fid=self.fid, areas=[area])
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: [1], CAMERA_IDS: [1]}))

    def test_class_filter_no_match(self):
        """
        Test filtering on class with no matching clips
        """
        data = {FILTER_ID: 1}
        dbw.modify_filter(fid=self.fid, classes=["car"])
        dbw.create_object_detection(cid=self.cid1, sample_rate=1, start_time=self.st1, end_time=self.et1,
                                    objects=[("bike", self.st1), ("bike", self.st1)])
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: [], CAMERA_IDS: []}))

    def test_class_filter_one_match(self):
        """
        Test filtering on class with one matching clip
        """
        data = {FILTER_ID: 1}
        dbw.modify_filter(fid=self.fid, classes=["car"])
        dbw.create_object_detection(cid=self.cid1, sample_rate=1, start_time=self.st1, end_time=self.et1,
                                    objects=[("cat", self.st1), ("car", self.st1)])
        dbw.create_object_detection(cid=self.cid2, sample_rate=1, start_time=self.st2, end_time=self.et2,
                                    objects=[("bike", self.st2), ("cat", self.st2)])
        res = get_clips_matching_filter(data)

        self.assertEqual(res, (200, {CLIP_IDS: [self.cid1], CAMERA_IDS: [dbw.get_clip_by_id(self.cid1).camera.id]}))

    def test_class_filter_multiple_match(self):
        """
        Test filtering on class with multiple matching clips
        """
        data = {FILTER_ID: 1}
        dbw.modify_filter(fid=self.fid, classes=["cat"])
        dbw.create_object_detection(cid=self.cid1, sample_rate=1, start_time=self.st1, end_time=self.et1,
                                    objects=[("cat", self.st1), ("car", self.st1)])
        dbw.create_object_detection(cid=self.cid2, sample_rate=1, start_time=self.st2, end_time=self.et2,
                                    objects=[("bike", self.st2), ("cat", self.st2)])
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: [1, 2], CAMERA_IDS: [1, 2]}))

    def test_class_filter_multiple_class(self):
        """
        Test filtering on class with multiple classes
        """
        data = {FILTER_ID: 1}
        dbw.modify_filter(fid=self.fid, classes=["cat", "car"])
        dbw.create_object_detection(cid=self.cid1, sample_rate=1, start_time=self.st1, end_time=self.et1,
                                    objects=[("cat", self.st1), ("car", self.st1)])
        dbw.create_object_detection(cid=self.cid2, sample_rate=1, start_time=self.st2, end_time=self.et2,
                                    objects=[("bike", self.st2), ("cat", self.st2)])
        res = get_clips_matching_filter(data)
        self.assertEqual(res, (200, {CLIP_IDS: [1], CAMERA_IDS: [1]}))

    def test_class_filter_object_detection_outside_timespan(self):
        """
        Test that the filter only filters on object detections within the timespan
        """

        data = {FILTER_ID: 1}
        cid1_copy = dbw.create_clip(fid=self.rid, name="test_clip1_copy", video_format="tvf",
                                    start_time=self.st1, end_time=self.et1, latitude=self.lat,
                                    longitude=self.lon + 1, width=200, height=300, frame_rate=42.0)

        dbw.modify_filter(fid=self.fid, classes=["car"], start_time=self.st1 + timezone.timedelta(seconds=10))

        dbw.create_object_detection(cid=self.cid1, sample_rate=1, start_time=self.st1, end_time=self.et1,
                                    objects=[("car", self.st1 + timezone.timedelta(seconds=1))])

        dbw.create_object_detection(cid=cid1_copy, sample_rate=1, start_time=self.st1, end_time=self.et1,
                                    objects=[("car", self.st1 + timezone.timedelta(seconds=11))])

        res = get_clips_matching_filter(data)

        self.assertEqual(res, (200, {CLIP_IDS: [3], CAMERA_IDS: [1]}))


class GetAreasInFilterTest(TestCase):
    def setUp(self) -> None:
        """
        Create filter and project
        """
        self.pid = dbw.create_project(name="test_project")
        self.fid = dbw.create_filter(pid=self.pid)

    def test_simple_call(self):
        """
        Test calling function with correct, simple parameters
        """
        data = {FILTER_ID: self.fid}
        res = get_areas_in_filter(data)
        self.assertEqual(res, (200, {AREAS: []}))

    def test_bad_fid(self):
        """
        Test calling function with nonexistent id
        """
        data = {FILTER_ID: 3}
        res = get_areas_in_filter(data)
        self.assertEqual(res, (204, {}))

    def test_one_area(self):
        """
        Test
        """
        area_id = dbw.create_area(Decimal(value="1.1"), Decimal(value="1.1"), Decimal(value="1.1"))
        dbw.modify_filter(self.fid, areas=[area_id])
        data = {FILTER_ID: self.fid}
        res = get_areas_in_filter(data)
        self.assertEqual(len(res[1]["areas"]), 1)

    def test_multiple_areas(self):
        """
        Test getting all areas when multiple area exist
        """
        area_id = dbw.create_area(Decimal(value="1.1"), Decimal(value="1.1"), Decimal(value="1.1"))
        area_id2 = dbw.create_area(Decimal(value="1.2"), Decimal(value="1.2"), Decimal(value="1.2"))
        dbw.modify_filter(self.fid, areas=[area_id, area_id2])
        data = {FILTER_ID: self.fid}
        res = get_areas_in_filter(data)
        self.assertEqual(len(res[1]["areas"]), 2)


class CreateAreaTest(TestCase):

    def test_simple_call(self) -> None:
        """
        Test calling function with correct values
        """
        data = {LATITUDE: Decimal(value="1.1"),
                LONGITUDE: Decimal(value="1.1"),
                RADIUS: Decimal(value="1.1")
                }

        res = create_area(data)
        self.assertEqual(res, (200, {AREA_ID: 1}))

    def test_missing_parameter(self) -> None:
        """
        Test calling function without necessary parameter
        """
        data = {LATITUDE: Decimal(value="1.1"),
                LONGITUDE: Decimal(value="1.1"),
                }

        res = create_area(data)
        self.assertEqual(res, (400, {}))


class GetFilterParametersTest(TestCase):
    def setUp(self) -> None:
        self.rid = dbw.create_root_folder(path="/home/user/", name="test_folder")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st1 = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et1 = self.st1 + timezone.timedelta(hours=1)
        self.st2 = self.st1 + timezone.timedelta(hours=2)
        self.et2 = self.st2 + timezone.timedelta(hours=1)

        self.cid1 = dbw.create_clip(fid=self.rid, name="test_clip1", video_format="tvf",
                                    start_time=self.st1, end_time=self.et1, latitude=self.lat,
                                    longitude=self.lon + 1, width=200, height=300, frame_rate=42.0)
        self.cid2 = dbw.create_clip(fid=self.rid, name="test_clip2", video_format="tvf",
                                    start_time=self.st2, end_time=self.et2, latitude=self.lat,
                                    longitude=self.lon, width=400, height=500, frame_rate=42.0)
        self.pid = dbw.create_project(name="test_project")
        self.fid = dbw.create_filter(pid=self.pid)
        dbw.add_folder_to_project(self.fid, self.pid)


    def test_simple_call(self):
        """
        Test calling function with correct fid
        """
        data = {FILTER_ID: self.fid}

        res = get_params(data)
        self.assertEqual(res, (200, {'classes': ['car', 'person', 'bicycle'], 'resolutions': [OrderedDict([('id', 1), ('width', 200), ('height', 300)]), OrderedDict([('id', 2), ('width', 400), ('height', 500)])]}))

    def test_missing_param(self):
        """
        Test calling function without necessary parameter
        """
        data = {}

        res = get_params(data)
        self.assertEqual(res, (400, {}))

    def test_nonexistent_fid(self):
        """
        Test calling function with nonexistent fid
        """
        data = {FILTER_ID: self.fid+10}

        res = get_params(data)
        self.assertEqual(res, (204, {}))
