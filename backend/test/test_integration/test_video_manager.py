import pytz
from django.conf import settings
from django.test import TestCase
from unittest.mock import patch

# Import module
from backend.video_manager import *


class GetClipInfoTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        mock_create_hash_sum.return_value = '1234'
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.cid = create_clip(name='test_clip', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                               longitude=Decimal('0.0'),
                               start_time=timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                               end_time=timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                               width=256, height=240, frame_rate=42)

    @patch('backend.video_manager.os_aware', side_effect=lambda x: x)
    def test_basic(self, mock_os_aware):
        """
        Makes a simple call.
        """
        code, res = get_clip_info(data={CLIP_ID: self.cid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {'id': 1, 'name': 'test_clip', 'video_format': 'tvf',
                               'start_time': '2020-01-17T00:00:00+01:00',
                               'end_time': '2020-01-18T00:00:00+01:00', 'resolution': 1,
                               'frame_rate': 42.0, 'folder': 1, 'camera': 1,
                               'file_path': 'home/user/test_folder/test_clip.tvf', 'duplicates': [],
                               'overlap': [], 'hash_sum': '1234'})


class GetSequentialClipTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        mock_create_hash_sum.return_value = '1234'
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.cid = create_clip(name='test_clip', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                               longitude=Decimal('0.0'),
                               start_time=timezone.now() - timezone.timedelta(hours=1),
                               end_time=timezone.now(),
                               width=256, height=240, frame_rate=42)
        self.clip = get_clip_by_id(cid=self.cid)

    @patch('backend.video_manager.os_aware', side_effect=lambda x: x)
    def test_basic(self, mock_os_aware):
        """
        Makes a simple call.
        """
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: None})

    @patch('backend.database_wrapper.create_hash_sum')
    def test_sequential_clip(self, mock_create_hash_sum):
        """
        Tests a sequential clip.
        """
        mock_create_hash_sum.return_value = '1234567'
        cid2 = create_clip(name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                           longitude=Decimal('0.0'), start_time=self.clip.end_time,
                           end_time=timezone.now() + timezone.timedelta(hours=1),
                           width=256, height=240, frame_rate=42)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: cid2})

    @patch('backend.database_wrapper.create_hash_sum')
    def test_almost_sequential_clip(self, mock_create_hash_sum):
        """
        Tests a clip that has a start time 5 seconds after the first clip.
        """
        mock_create_hash_sum.return_value = '1234567'
        cid2 = create_clip(name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                           longitude=Decimal('0.0'),
                           start_time=self.clip.end_time + timezone.timedelta(seconds=5),
                           end_time=timezone.now() + timezone.timedelta(hours=1),
                           width=256, height=240, frame_rate=42)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: cid2})

    @patch('backend.database_wrapper.create_hash_sum')
    def test_not_sequential_clip(self, mock_create_hash_sum):
        """
        Tests a clip that is not sequential.
        """
        mock_create_hash_sum.return_value = '1234567'
        create_clip(name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                    longitude=Decimal('0.0'),
                    start_time=self.clip.end_time + timezone.timedelta(seconds=6),
                    end_time=timezone.now() + timezone.timedelta(hours=1),
                    width=256, height=240, frame_rate=42)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: None})


class GetCamerasTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        """
        Create cameras and a project.
        """
        mock_create_hash_sum.return_value = '1234'
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
        self.assertEqual(len(res[CAMERAS]), 2)

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = get_cameras(data={PROJECT_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class GetVideoStreamTest(TestCase):
    def test_simple_call(self):
        pass
        # TODO: I have no idea how to test this one
