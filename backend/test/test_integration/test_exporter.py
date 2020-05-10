import pytz
from django.conf import settings
from django.test import TestCase
from unittest.mock import patch
import json

# Import module
from backend.exporter import *


class ExportFilterTest(TestCase):
    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        """
        Create a folder, clip, project and filter.
        """
        mock_create_hash_sum.return_value = '1234'
        self.cm_name = 'Test camera name'
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.lat = Decimal(value="1.1")
        self.lon = Decimal(value="1.1")
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.cid1 = create_clip(fid=self.rid, clip_name="test_clip1", video_format="tvf",
                                start_time=self.st, end_time=self.et, latitude=self.lat,
                                longitude=self.lon, width=256, height=240, frame_rate=42.0, camera_name=self.cm_name)
        self.cid2 = create_clip(fid=self.rid, clip_name="test_clip2", video_format="tvf",
                                start_time=self.st, end_time=self.et, latitude=self.lat,
                                longitude=self.lon, width=256, height=240, frame_rate=42.0, camera_name=self.cm_name)
        self.pid = create_project(name="test_project")
        self.fid = create_filter(pid=self.pid)
        add_folder_to_project(self.fid, self.pid)
        create_area(Decimal(value="1.1"), Decimal(value="1.1"), 1000, self.fid)

    @patch('backend.exporter.os_aware', side_effect=lambda x: x)
    def test_basic(self, mock_os_aware):
        modify_filter(fid=self.fid, start_time=self.st, end_time=self.et)
        res = export_filter(fid=self.fid)
        data = json.loads(res.content.decode('utf-8'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(data['filter'], {'start_time': '2020-01-16 23:00:00+00:00',
                                         'end_time': '2020-01-17 23:00:00+00:00', 'objects': []})
        self.assertEqual(data['areas'], [{'latitude': '1.1000000', 'longitude': '1.1000000', 'radius': 1000}])
        self.assertEqual(data['clips'], [os_aware(
            {'file_path': '\\home\\user\\test_folder\\test_clip1.tvf', 'start_time': '2020-01-16 23:00:00+00:00'}),
            os_aware({'file_path': '\\home\\user\\test_folder\\test_clip2.tvf',
                      'start_time': '2020-01-16 23:00:00+00:00'})])

    def test_object(self):
        modify_filter(fid=self.fid, start_time=self.st, end_time=self.et, classes=["car"])
        res = export_filter(fid=self.fid)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.content.decode('utf-8'))
        self.assertEqual(data,
                         {'filter': {'start_time': '2020-01-16 23:00:00+00:00', 'end_time': '2020-01-17 23:00:00+00:00',
                                     'objects': ['car']},
                          'areas': [
                              {'latitude': '1.1000000', 'longitude': '1.1000000', 'radius': 1000}],
                          'clips': []})

    def test_non_existing_filter(self):
        """
        Test with a project id that doesn't exist.
        """
        res = export_filter(fid=42)
        self.assertEqual(res.status_code, 204)


class ExportClipsTest(TestCase):
    # TODO: Create integration tests
    pass
