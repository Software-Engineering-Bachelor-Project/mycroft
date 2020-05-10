import pytz
from django.conf import settings
from django.test import TestCase
from unittest.mock import patch

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

    def test_basic(self):
        """
        Makes a simple call.
        """
        pass
