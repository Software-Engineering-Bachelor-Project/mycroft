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
        self.cm_name = 'Test camera name'
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.cid = create_clip(clip_name='test_clip', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                               longitude=Decimal('0.0'),
                               start_time=timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                               end_time=timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE)),
                               width=256, height=240, frame_rate=42, camera_name=self.cm_name)

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
                               'overlap': [], 'hash_sum': '1234', 'playable': False})


class GetSequentialClipTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        mock_create_hash_sum.return_value = '1234'
        self.cm_name = 'Test camera name'
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.cid = create_clip(clip_name='test_clip', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                               longitude=Decimal('0.0'), start_time=timezone.now() - timezone.timedelta(hours=1),
                               end_time=timezone.now(), width=256, height=240, frame_rate=42, camera_name=self.cm_name)
        self.clip = get_clip_by_id(cid=self.cid)

    def test_basic(self):
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
        cid2 = create_clip(clip_name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                           longitude=Decimal('0.0'), start_time=self.clip.end_time,
                           end_time=timezone.now() + timezone.timedelta(hours=1),
                           width=256, height=240, frame_rate=42, camera_name=self.cm_name)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: cid2})

    @patch('backend.database_wrapper.create_hash_sum')
    def test_almost_sequential_clip(self, mock_create_hash_sum):
        """
        Tests a clip that has a start time 5 seconds after the first clip.
        """
        mock_create_hash_sum.return_value = '1234567'
        cid2 = create_clip(clip_name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                           longitude=Decimal('0.0'),
                           start_time=self.clip.end_time + timezone.timedelta(seconds=5),
                           end_time=timezone.now() + timezone.timedelta(hours=1),
                           width=256, height=240, frame_rate=42, camera_name=self.cm_name)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: cid2})

    @patch('backend.database_wrapper.create_hash_sum')
    def test_not_sequential_clip(self, mock_create_hash_sum):
        """
        Tests a clip that is not sequential.
        """
        mock_create_hash_sum.return_value = '1234567'
        create_clip(clip_name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                    longitude=Decimal('0.0'),
                    start_time=self.clip.end_time + timezone.timedelta(seconds=6),
                    end_time=timezone.now() + timezone.timedelta(hours=1),
                    width=256, height=240, frame_rate=42, camera_name=self.cm_name)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: None})

    @patch('backend.database_wrapper.create_hash_sum')
    def test_sequential_clip_different_camera(self, mock_create_hash_sum):
        """
        Tests a clip that is sequential but belongs to a different camera.
        """
        cm_name = 'Another test camera name'
        mock_create_hash_sum.return_value = '1234567'
        cid2 = create_clip(clip_name='test_clip2', fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                           longitude=Decimal('0.0'), start_time=self.clip.end_time,
                           end_time=timezone.now() + timezone.timedelta(hours=1),
                           width=256, height=240, frame_rate=42, camera_name=cm_name)
        code, res = get_sequential_clip(data={CLIP_ID: self.cid})

        self.assertEqual(code, 200)
        self.assertEqual(res, {CLIP_ID: None})


class GetCamerasTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        """
        Create cameras and a project.
        """
        self.cm_name1 = 'Test camera name'
        self.cm_name2 = 'Test another camera name'
        self.pid = create_project(name="test_project")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.sid = create_subfolder(parent_fid=self.rid, name="test_subfolder")

        mock_create_hash_sum.return_value = '1234'
        create_clip(fid=self.rid, clip_name="test_clip1", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0, camera_name=self.cm_name1)
        mock_create_hash_sum.return_value = '12345'
        create_clip(fid=self.sid, clip_name="test_clip2", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0, camera_name=self.cm_name1)
        mock_create_hash_sum.return_value = '123456'
        create_clip(fid=self.sid, clip_name="test_clip3", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lon, longitude=self.lat, width=256, height=240,
                    frame_rate=42.0, camera_name=self.cm_name2)
        add_folder_to_project(fid=self.rid, pid=self.pid)

    def test_basic(self):
        """
        Makes a simple call.
        """
        code, res = get_cameras(data={PROJECT_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(len(res[CAMERAS]), 2)

    @patch('backend.database_wrapper.create_hash_sum')
    def test_camera_has_only_clips_in_project(self, mock_create_hash_sum):
        """
        Tests that camera only contains clip that is in current project.
        """
        pid2 = create_project(name="test_project2")
        rid2 = create_root_folder(path="/home/user/", name="test_folder2")

        mock_create_hash_sum.return_value = '1234567'
        create_clip(fid=rid2, clip_name="test_clip4", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0, camera_name=self.cm_name1)
        mock_create_hash_sum.return_value = '12345678'
        create_clip(fid=rid2, clip_name="test_clip5", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0, camera_name=self.cm_name2)
        mock_create_hash_sum.return_value = '123456789'
        create_clip(fid=rid2, clip_name="test_clip6", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0, camera_name=self.cm_name2)
        add_folder_to_project(fid=rid2, pid=pid2)

        code, res = get_cameras(data={PROJECT_ID: pid2})
        self.assertEqual(len(res[CAMERAS]), 2)
        self.assertEqual(len(res[CAMERAS][0]['clip_set']), 1)
        self.assertEqual(len(res[CAMERAS][1]['clip_set']), 2)

        code, res = get_cameras(data={PROJECT_ID: self.pid})
        self.assertEqual(len(res[CAMERAS]), 2)
        self.assertEqual(len(res[CAMERAS][0]['clip_set']), 2)
        self.assertEqual(len(res[CAMERAS][1]['clip_set']), 1)

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
