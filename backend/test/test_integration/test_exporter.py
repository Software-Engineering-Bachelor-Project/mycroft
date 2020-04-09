import pytz
from django.conf import settings
from django.test import TestCase

# Import module
from backend.exporter import *


class ExportFilterTest(TestCase):

    def setUp(self) -> None:
        """
        Create a folder, clip, project and filter.
        """
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))
        create_clip(fid=self.rid, name="test_clip1", video_format="tvf",
                    start_time=self.st, end_time=self.et, latitude=self.lat,
                    longitude=self.lon, width=256, height=240, frame_rate=42.0)
        create_clip(fid=self.rid, name="test_clip2", video_format="tvf",
                    start_time=self.st, end_time=self.et, latitude=self.lat,
                    longitude=self.lon, width=256, height=240, frame_rate=42.0)
        self.pid = create_project(name="test_project")
        self.fid = create_filter(pid=self.pid)
        add_folder_to_project(self.fid, self.pid)

    def test_basic(self):
        modify_filter(fid=self.fid, start_time=self.st, end_time=self.et, add_classes=['bike', 'car'])
        code, res = export_filter(data={FILTER_ID: self.fid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {'start_time': '2020-01-16 23:00:00+00:00', 'end_time': '2020-01-17 23:00:00+00:00',
                               'clips': ['/home/user/test_folder/test_clip1.tvf',
                                         '/home/user/test_folder/test_clip2.tvf']})

    def test_non_existing_filter(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = export_filter(data={FILTER_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class ExportClipsTest(TestCase):
    # TODO: Create integration tests
    pass
