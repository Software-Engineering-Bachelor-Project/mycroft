from django.test import TestCase
from unittest.mock import patch

# Import module
from backend.object_detector import *


class DetectObjectsTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the detect_objects function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = detect_objects({})
        #self.assertEqual(res[0], 200)


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


class ObjectDetectorTest(TestCase):
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
