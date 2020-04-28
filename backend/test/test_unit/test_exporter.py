import pytz
from django.conf import settings
from django.test import TestCase
from unittest.mock import patch, Mock, mock_open

# Import module
from backend.exporter import *

BINARY_TEXT = b'thisisavideofile'


class ExportFilterTest(TestCase):

    @patch('backend.exporter.os_aware')
    @patch('backend.exporter.get_all_clips_matching_filter')
    @patch('backend.exporter.get_filter_by_id')
    def test_basic(self, mock_get_filter_by_id, mock_get_all_clips_matching_filter, mock_os_aware):
        """
        Makes a simple call.
        """
        mock_get_filter_by_id.return_value.start_time = timezone.datetime(2020, 1, 17,
                                                                          tzinfo=pytz.timezone(settings.TIME_ZONE))
        mock_get_filter_by_id.return_value.end_time = timezone.datetime(2020, 1, 18,
                                                                        tzinfo=pytz.timezone(settings.TIME_ZONE))
        mock_get_all_clips_matching_filter.return_value = []
        code, res = export_filter(data={FILTER_ID: 42})
        mock_get_filter_by_id.assert_called_once_with(fid=42)
        mock_get_all_clips_matching_filter.assert_called_once_with(fid=42)
        mock_os_aware.assert_called_once_with(
            {'start_time': '2020-01-17 00:00:00+01:00', 'end_time': '2020-01-18 00:00:00+01:00', 'clips': []})
        self.assertEqual(code, 200)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = export_filter(data={FOLDER_ID: 42})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class ExportClipsTest(TestCase):

    @patch('builtins.open', new_callable=mock_open, read_data=BINARY_TEXT)
    @patch('backend.exporter.get_clip_by_id')
    @patch('backend.exporter.gzip.compress')
    def test_compress_clips(self, mock_compress, mock_get_clip_by_id, mock_file):
        """
        Tests the compress_clips function
        """
        x = Mock()
        mock_get_clip_by_id.return_value = x
        x.folder.path = "home/user/"
        x.folder.name = "test_folder"
        x.name = "test_clip"
        x.video_format = "avi"

        mock_compress.return_value = True
        code, compressed_list = compress_clips([1, 2, 3])
        mock_file.assert_called_with(file='home/user/test_folder/test_clip.avi', mode='rb')
        mock_get_clip_by_id.assert_called()
        mock_compress.assert_called_with(BINARY_TEXT)

        self.assertEqual(code, 200)
        self.assertEqual(compressed_list, [True, True, True])

    @patch('backend.exporter.compress_clips')
    def test_basic(self, mock_compress_clips):
        """
        Makes a simple call.
        """
        mock_compress_clips.return_value = [3, 4]
        code, compressed = export_clips(data={CLIP_IDS: [1, 2]})
        mock_compress_clips.assert_called_once_with(clip_ids=[1, 2])
        self.assertEqual(code, 200)
        self.assertEqual(compressed, [3, 4])