from unittest.mock import patch
from decimal import Decimal

from django.test import TestCase
from backend.communication_utils import *

# Import module
from backend.filter_module import *


class ModifyFilterTest(TestCase):

    @patch('backend.filter_module.dbw.modify_filter')
    def test_simple_call(self, mock_dbw_modify_filter):
        """
        Makes a simple call to the function.
        """
        data = {FILTER_ID: "TEST_fid",
                START_TIME: "TEST_st",
                END_TIME: "TEST_et",
                ADD_CLASSES: "TEST_AC",
                REMOVE_CLASSES: "TEST_RC",
                MIN_WIDTH: "TEST_mw",
                MIN_HEIGHT: "TEST_mh",
                MIN_FRAMERATE: "TEST_mfr"
                }
        res = modify_filter(data)
        mock_dbw_modify_filter.assert_called_once_with(fid=data[FILTER_ID], start_time=data[START_TIME],
                                                       end_time=data[END_TIME], add_classes=data[ADD_CLASSES],
                                                       remove_classes=data[REMOVE_CLASSES], min_width=data[MIN_WIDTH],
                                                       min_height=data[MIN_HEIGHT],
                                                       min_frame_rate=data[MIN_FRAMERATE])

    def test_missing_parameter(self):
        """
        Tests calling the function without all parameters
        """
        data = {START_TIME: "TEST_st",
                END_TIME: "TEST_et",
                ADD_CLASSES: "TEST_AC"
                }
        self.assertEqual(modify_filter(data), (400, {}))

    @patch('backend.filter_module.dbw.modify_filter', side_effect=AssertionError())
    def test_database_error(self, mock_dbw_modify_filter):
        """
        Tests calling the function with parameters that causes error in database
        """
        data = {FILTER_ID: "TEST_fid",
                START_TIME: "TEST_st",
                END_TIME: "TEST_et",
                ADD_CLASSES: "TEST_AC",
                REMOVE_CLASSES: "TEST_RC",
                MIN_WIDTH: "TEST_mw",
                MIN_HEIGHT: "TEST_mh",
                MIN_FRAMERATE: "TEST_mfr"
                }
        self.assertEqual(modify_filter(data), (204, {}))


class GetClipsMatchingFilter(TestCase):

    @patch('backend.filter_module.dbw')
    def test_simple_call(self, mock_dbw):
        """
        Makes a simple call to the function.
        """
        data = {FILTER_ID: "TEST_fid",
                CAMERA_IDS: []
                }

        res = get_clips_matching_filter(data)

        mock_dbw.get_all_clips_matching_filter.assert_called_once_with("TEST_fid")
        mock_dbw.get_all_excluded_clips_in_filter.assert_called_once_with("TEST_fid")
        mock_dbw.get_all_included_clips_in_filter.assert_called_once_with("TEST_fid")
        self.assertEqual(res, (200, {CLIP_IDS: [], CAMERA_IDS: []}))

    def test_missing_parameter(self):
        """
        Tests calling the function without all parameters.
        """
        data = {FILTER_ID: "TEST_fid"
                }
        self.assertEqual(get_clips_matching_filter(data), (400, {}))

    @patch('backend.filter_module.dbw.get_all_clips_matching_filter', side_effect=AssertionError())
    def test_database_error(self, mock_dbw_modify_filter):
        """
        Tests calling the function with parameters that causes error in database
        """
        data = {FILTER_ID: "TEST_fid",
                CAMERA_IDS: []
                }

        self.assertEqual(get_clips_matching_filter(data), (204, {}))


class GetClipsBelongingToCamerasTest(TestCase):

    def test_simple_call(self):
        """
        Tests calling the function with simple parameters.
        """
        self.assertEqual(get_clips_belonging_to_cameras([], []), [])
