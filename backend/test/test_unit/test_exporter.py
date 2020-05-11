import pytz
from django.conf import settings
from django.test import TestCase
from unittest.mock import patch, call

# Import module
from backend.exporter import *


class ExportFilterTest(TestCase):

    @patch('backend.exporter.JsonResponse')
    @patch('backend.exporter.os_aware')
    @patch('backend.exporter.get_all_clips_matching_filter')
    @patch('backend.exporter.get_filter_by_id')
    def test_basic(self, mock_get_filter_by_id, mock_get_all_clips_matching_filter, mock_os_aware, mock_json_response):
        """
        Makes a simple call.
        """
        mock_get_filter_by_id.return_value.start_time = timezone.datetime(2020, 1, 17,
                                                                          tzinfo=pytz.timezone(settings.TIME_ZONE))
        mock_get_filter_by_id.return_value.end_time = timezone.datetime(2020, 1, 18,
                                                                        tzinfo=pytz.timezone(settings.TIME_ZONE))
        mock_get_filter_by_id.return_value.classes.all.return_value = []
        mock_get_all_clips_matching_filter.return_value = []
        res = export_filter(fid=42)
        mock_get_filter_by_id.assert_called_once_with(fid=42)
        mock_get_all_clips_matching_filter.assert_called_with(fid=42)
        mock_os_aware.assert_called_once_with(
            {'filter': {'start_time': '2020-01-17 00:00:00+01:00', 'end_time': '2020-01-18 00:00:00+01:00',
                        'objects': []}, 'areas': [], 'clips': []})
        mock_json_response.assert_called_once_with(mock_os_aware.return_value)


class ExportClipsTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        """
        Setup a test project.
        """
        mock_create_hash_sum.return_value = '1234'
        self.cam_name = 'test_camera'
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))

        self.pid = create_project(name="test_project")
        self.rid = create_root_folder(path='home/user/', name='test_folder')
        self.sid1 = create_subfolder(parent_fid=self.rid, name='test_subfolder')
        self.sid2 = create_subfolder(parent_fid=self.rid, name='another_test_subfolder')
        self.sid3 = create_subfolder(parent_fid=self.sid1, name='third_test_subfolder')
        self.cid1 = create_clip(fid=self.rid, clip_name="test_clip1", video_format="tvf", start_time=self.st,
                                end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                frame_rate=42.0, camera_name=self.cam_name)
        self.cid2 = create_clip(fid=self.sid1, clip_name="test_clip2", video_format="tvf", start_time=self.st,
                                end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                frame_rate=42.0, camera_name=self.cam_name)
        self.cid3 = create_clip(fid=self.sid3, clip_name="test_clip3", video_format="tvf", start_time=self.st,
                                end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                frame_rate=42.0, camera_name=self.cam_name)
        add_folder_to_project(fid=self.rid, pid=self.pid)
        self.fid = create_filter(pid=self.pid)

    @patch.object(ZipFile, 'write', return_value=None)
    def test_basic(self, mock_write):
        """
        Makes a simple call.
        """
        export_clips(fid=self.fid)
        self.assertEqual(mock_write.call_count, 6)
        mock_write.assert_has_calls([
            call('home/user/test_folder/test_clip1.tvf',
                 arcname=replace_sep('test_folder/test_clip1.tvf')),
            call('home/user/test_folder/test_clip1.tvf.txt',
                 arcname=replace_sep('test_folder/test_clip1.tvf.txt')),
            call('home/user/test_folder/test_subfolder/test_clip2.tvf',
                 arcname=replace_sep('test_folder/test_subfolder/test_clip2.tvf')),
            call('home/user/test_folder/test_subfolder/test_clip2.tvf.txt',
                 arcname=replace_sep('test_folder/test_subfolder/test_clip2.tvf.txt')),
            call('home/user/test_folder/test_subfolder/third_test_subfolder/test_clip3.tvf',
                 arcname=replace_sep('test_folder/test_subfolder/third_test_subfolder'
                                     '/test_clip3.tvf')),
            call('home/user/test_folder/test_subfolder/third_test_subfolder/test_clip3.tvf.txt',
                 arcname=replace_sep('test_folder/test_subfolder/third_test_subfolder'
                                     '/test_clip3.tvf.txt'))])
