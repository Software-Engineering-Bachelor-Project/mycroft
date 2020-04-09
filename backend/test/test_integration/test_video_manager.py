import pytz
from django.conf import settings
from django.test import TestCase

# Import module
from backend.video_manager import *


class GetClipInfoTest(TestCase):

    def setUp(self) -> None:
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.cid = create_clip(name='test_clip', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                               longitude=Decimal('0.0'),
                               start_time=timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                               end_time=timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                               width=256, height=240, frame_rate=42)

    def test_basic(self):
        """
        Makes a simple call.
        """
        code, res = get_clip_info(data={CLIP_ID: self.cid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {'id': 1, 'name': 'test_clip', 'video_format': 'tvf',
                               'start_time': '2020-01-17T00:00:00+01:00',
                               'end_time': '2020-01-18T00:00:00+01:00', 'width': 256, 'height': 240,
                               'frame_rate': 42.0, 'folder': 1, 'camera': 1})


class GetCamerasTest(TestCase):

    def setUp(self) -> None:
        """
        Create cameras and a project.
        """
        self.pid = create_project(name="test_project")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.sid = create_subfolder(parent_fid=self.rid, name="test_subfolder")
        create_clip(fid=self.rid, name="test_clip1", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0)
        create_clip(fid=self.sid, name="test_clip2", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0)
        create_clip(fid=self.sid, name="test_clip3", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lon, longitude=self.lat, width=256, height=240,
                    frame_rate=42.0)
        add_folder_to_project(fid=self.rid, pid=self.pid)

    def test_basic(self):
        """
        Makes a simple call.
        """
        code, res = get_cameras(data={PROJECT_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(res, [OrderedDict([('id', 1), ('latitude', '13.37000000'), ('longitude', '0.42000000'),
                                            ('start_time', '2020-01-17T00:00:00+01:00'),
                                            ('end_time', '2020-01-18T00:00:00+01:00')]), OrderedDict(
            [('id', 2), ('latitude', '0.42000000'), ('longitude', '13.37000000'),
             ('start_time', '2020-01-17T00:00:00+01:00'), ('end_time', '2020-01-18T00:00:00+01:00')])])

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = get_cameras(data={PROJECT_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})
