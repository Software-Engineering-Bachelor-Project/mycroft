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
        self.assertEqual(res[0], 200)


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


