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
                CLASSES: "TEST_AC",
                WHITELISTED_RESOLUTIONS: "b_0",
                MIN_FRAMERATE: "min_f",
                EXCLUDED_CLIP_IDS: "exc_clip",
                INCLUDED_CLIP_IDS: "inc_clip",
                AREA_IDS: "area_ids"
                }
        res = modify_filter(data)
        mock_dbw_modify_filter.assert_called_once_with(fid=data[FILTER_ID], start_time=None,
                                                       end_time=None, classes=data[CLASSES],
                                                       min_frame_rate=data[MIN_FRAMERATE],
                                                       whitelisted_resolutions=data[WHITELISTED_RESOLUTIONS],
                                                       excluded_clips=data[EXCLUDED_CLIP_IDS],
                                                       included_clips=data[INCLUDED_CLIP_IDS], areas=data[AREA_IDS]
                                                       )

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
        self.assertEqual(res, (200, {CLIP_IDS: [], CAMERA_IDS: []}))

    def test_missing_parameter(self):
        """
        Tests calling the function without all parameters.
        """
        data = {}
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


class GetAreasInFilterTest(TestCase):

    @patch('backend.filter_module.dbw')
    def test_simple_call(self, mock_dbw):
        """
        Makes a simple call to the function, check that the correct function is called in the database_wrapper
        """
        data = {FILTER_ID: "test_data"}

        res = get_clips_matching_filter(data)
        mock_dbw.get_all_clips_matching_filter.assert_called_once_with("test_data")


class CreateArea(TestCase):

    @patch('backend.filter_module.dbw')
    def test_simple_call(self, mock_dbw):
        """
        Makes a simple call to the function, check that the correct function is called in the database_wrapper
        """
        data = {LATITUDE: Decimal(value="1.1"),
                LONGITUDE: Decimal(value="1.1"),
                RADIUS: Decimal(value="1.1")
                }

        res = create_area(data)
        mock_dbw.create_area.assert_called_once_with(**data)
