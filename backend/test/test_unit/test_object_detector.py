from django.test import TestCase
from unittest.mock import patch
import pytz
from django.conf import settings

# Import module
from backend.object_detector import *


class DetectObjectsTest(TestCase):

    @patch('backend.object_detector.ObjectDetector')
    @patch('backend.object_detector.threading')
    @patch('backend.object_detector.create_progress')
    def test_basic(self, mock_create_progress, mock_threading, mock_od):
        """
        Makes a simple call.
        """
        mock_create_progress.return_value = 1337
        code, res = detect_objects({CLIP_IDS: [42, 6, 11], RATE: 1})
        mock_create_progress.assert_called_once_with(total=3)
        mock_threading.Thread.assert_called_once_with(target=mock_od.return_value.run_object_detection,
                                                      args=([42, 6, 11], 1337, 1, None, None))
        mock_threading.Thread.return_value.start.assert_called_once()
        self.assertEqual(code, 200)
        self.assertEqual(res, {PROGRESS_ID: 1337})

    @patch('backend.object_detector.ObjectDetector')
    @patch('backend.object_detector.threading')
    @patch('backend.object_detector.create_progress')
    def test_interval(self, mock_create_progress, mock_threading, mock_od):
        """
        Makes a simple call with start and end time for detection.
        Checks if parsing of dates is done in a correct way.
        """
        mock_create_progress.return_value = 1337
        code, res = detect_objects(
            {CLIP_IDS: [42, 6, 11], RATE: 1, START_TIME: '2020-05-17T00:00:00+01:00',
             END_TIME: '2020-05-18T00:00:00+01:00'})
        mock_create_progress.assert_called_once_with(total=3)
        st = timezone.datetime(2020, 5, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        et = timezone.datetime(2020, 5, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))
        mock_threading.Thread.assert_called_once_with(target=mock_od.return_value.run_object_detection,
                                                      args=([42, 6, 11], 1337, 1, st, et))
        mock_threading.Thread.return_value.start.assert_called_once()
        self.assertEqual(code, 200)
        self.assertEqual(res, {PROGRESS_ID: 1337})

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = detect_objects(data={CLIP_IDS: [42, 6, 11]})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class GetProgressTest(TestCase):

    @patch('backend.object_detector.get_progress_by_id')
    def test_basic(self, mock_get_progress_by_id):
        """
        Test simple call.
        """
        mock_get_progress_by_id.return_value.total = 1337
        mock_get_progress_by_id.return_value.current = 3
        code, res = get_progress(data={PROGRESS_ID: 42})
        mock_get_progress_by_id.assert_called_once_with(pid=42)
        self.assertEqual(code, 200)
        self.assertEqual(res, {TOTAL: 1337, CURRENT: 3})

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = get_progress(data={PROJECT_ID: 42})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class DeleteProgressTest(TestCase):

    @patch('backend.object_detector.dbw_delete_progress')
    def test_basic(self, mock_dbw_delete_progress):
        """
        Test simple call.
        """
        code, res = delete_progress(data={PROGRESS_ID: 42})
        mock_dbw_delete_progress.assert_called_once_with(pid=42)
        self.assertEqual(code, 200)
        self.assertEqual(res, {})

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = delete_progress(data={PROJECT_ID: 42})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class RunObjectDetectionTest(TestCase):

    def setUp(self) -> None:
        self.od = ObjectDetector()
        self.st = timezone.now()
        self.et = timezone.now() + timezone.timedelta(seconds=5)

    @patch('backend.object_detector.update_progress')
    @patch('backend.object_detector.replace_sep')
    @patch('backend.object_detector.get_clip_by_id')
    @patch('backend.object_detector.create_object_detection')
    @patch('backend.object_detector.ObjectDetector.detect')
    def interval_test(self, mock_detect, mock_create_object_detection, mock_get_clip_by_id, mock_replace_sep,
                      mock_update_progress, start_time: timezone.datetime, end_time: timezone.datetime,
                      expected_start_sec: int, expected_end_sec: int, expected_start_time: timezone.datetime = None,
                      expected_end_time: timezone.datetime = None, runs_object_detection: bool = True):
        """
        Test without specifying interval.
        """
        mock_replace_sep.return_value = 'PATH'
        mock_detect.return_value = []
        mock_get_clip_by_id.return_value.id = 42
        mock_get_clip_by_id.return_value.start_time = self.st
        mock_get_clip_by_id.return_value.end_time = self.et
        self.od.run_object_detection(cids=[42], pid=1337, rate=1, start_time=start_time, end_time=end_time)
        if runs_object_detection:
            mock_detect.assert_called_once_with(clip='PATH', rate=1, start=expected_start_sec, end=expected_end_sec)
            mock_create_object_detection.assert_called_once_with(cid=42, sample_rate=1, start_time=expected_start_time,
                                                                 end_time=expected_end_time, objects=[])
        else:
            mock_create_object_detection.assert_not_called()
        mock_update_progress.assert_called_once_with(pid=1337)

    def test_no_interval(self):
        """
        Test without specifying interval.
        """
        self.interval_test(start_time=None, end_time=None, expected_start_sec=0, expected_end_sec=None,
                           expected_start_time=self.st + timezone.timedelta(seconds=0),
                           expected_end_time=self.et + timezone.timedelta(seconds=0))

    def test_interval_before_clip(self):
        """
        Test with specified interval
        """
        self.interval_test(start_time=self.st - timezone.timedelta(seconds=2),
                           end_time=self.st - timezone.timedelta(seconds=1), expected_start_sec=0, expected_end_sec=0,
                           runs_object_detection=False)

    def test_interval_after_clip(self):
        """
        Test with specified interval
        """
        self.interval_test(start_time=self.et + timezone.timedelta(seconds=1),
                           end_time=self.et + timezone.timedelta(seconds=2), expected_start_sec=6, expected_end_sec=6,
                           runs_object_detection=False)

    def test_interval_inside_clip(self):
        """
        Test with specified interval inside clip
        """
        self.interval_test(start_time=self.st + timezone.timedelta(seconds=1),
                           end_time=self.et - timezone.timedelta(seconds=1), expected_start_sec=1, expected_end_sec=4,
                           expected_start_time=self.st + timezone.timedelta(seconds=1),
                           expected_end_time=self.et + timezone.timedelta(seconds=-1))

    def test_interval_overlapping_clip(self):
        """
        Test with specified interval overlapping clip.
        """
        self.interval_test(start_time=self.st - timezone.timedelta(seconds=1),
                           end_time=self.et + timezone.timedelta(seconds=1), expected_start_sec=0, expected_end_sec=5,
                           expected_start_time=self.st + timezone.timedelta(seconds=0),
                           expected_end_time=self.et + timezone.timedelta(seconds=0))

    def test_interval_overlapping_start_time(self):
        """
        Test with specified interval overlapping start time.
        """
        self.interval_test(start_time=self.st - timezone.timedelta(seconds=1),
                           end_time=self.et - timezone.timedelta(seconds=1), expected_start_sec=0, expected_end_sec=4,
                           expected_start_time=self.st + timezone.timedelta(seconds=0),
                           expected_end_time=self.et + timezone.timedelta(seconds=-1))

    def test_interval_overlapping_end_time(self):
        """
        Test with specified interval overlapping end time.
        """
        self.interval_test(start_time=self.st + timezone.timedelta(seconds=1),
                           end_time=self.et + timezone.timedelta(seconds=1), expected_start_sec=1, expected_end_sec=5,
                           expected_start_time=self.st + timezone.timedelta(seconds=1),
                           expected_end_time=self.et + timezone.timedelta(seconds=0))


class DetectTest(TestCase):
    """
    Since most of the code is based on an example and visual testing has been performed (using debug=True)
    further testing is not deemed necessary.
    """

    @patch('backend.object_detector.os')
    @patch('backend.object_detector.cv2')
    def test_create_net(self, mock_cv2, mock_os):
        """
        Test that a net is created with the given YOLO version.
        """
        mock_os.path.sep = '/'
        mock_cv2.dnn.readNet.return_value.getLayerNames.return_value = []
        mock_cv2.dnn.readNet.return_value.getUnconnectedOutLayers.return_value = []
        od = ObjectDetector(yolov='some_yolo_version')
        mock_cv2.dnn.readNet.assert_called_once_with("backend/utils/some_yolo_version.weights",
                                                     "backend/utils/some_yolo_version.cfg")
        self.assertIsNotNone(od.classes)

    def test_non_existent_clip(self):
        """
        Test detection on a non existent file. Should give FileNotFoundError.
        """
        od = ObjectDetector()
        self.assertRaises(FileNotFoundError, od.detect, clip='home/user/test_folder/test_clip')
