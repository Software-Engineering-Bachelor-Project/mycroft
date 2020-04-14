from django.test import TestCase
from unittest.mock import patch, call

# Import module
from backend.object_detector import *


class DetectObjectsTest(TestCase):
    """
    Hard to test full call because of threading.
    """

    def setUp(self) -> None:
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.st = timezone.now()
        self.et = timezone.now() + timezone.timedelta(seconds=5)
        self.cids = []
        for i in range(1, 4):
            self.cids.append(
                create_clip(name='test_clip{}'.format(i), fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                            longitude=Decimal('0.0'), start_time=self.st + timezone.timedelta(seconds=3 * i - 2),
                            end_time=self.et + timezone.timedelta(seconds=3 * i - 2),
                            width=256, height=240, frame_rate=42))

    @patch('backend.object_detector.ObjectDetector')
    @patch('backend.object_detector.threading')
    def test_basic(self, mock_threading, mock_od):
        """
        Makes a simple call.
        """
        code, res = detect_objects({CLIP_IDS: self.cids, RATE: 1})
        self.assertEqual(code, 200)
        self.assertEqual(res, {PROGRESS_ID: 1})


class GetProgressTest(TestCase):

    def setUp(self) -> None:
        """
        Create a progress object.
        """
        self.pid = create_progress(total=1337, current=42)

    def test_basic(self):
        """
        Test simple call.
        """
        code, res = get_progress(data={PROGRESS_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {TOTAL: 1337, CURRENT: 42})

    def test_non_existing_progress(self):
        """
        Test with a non existing progress id.
        """
        code, res = get_progress(data={PROGRESS_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class DeleteProgressTest(TestCase):

    def setUp(self) -> None:
        """
        Create a progress object.
        """
        self.pid = create_progress(total=1337, current=42)

    def test_basic(self):
        """
        Test simple call.
        """
        code, res = delete_progress(data={PROGRESS_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {})
        self.assertEqual(Progress.objects.count(), 0)

    def test_non_existing_progress(self):
        """
        Test with a non existing progress id.
        """
        code, res = delete_progress(data={PROGRESS_ID: 42})
        self.assertEqual(code, 200)
        self.assertEqual(res, {})
        self.assertEqual(Progress.objects.count(), 1)


class RunObjectDetectionTest(TestCase):

    def setUp(self) -> None:
        self.fid = create_root_folder(path='home/user/', name='test_folder')
        self.st = timezone.now()
        self.et = timezone.now() + timezone.timedelta(seconds=5)
        self.cids = []
        for i in range(1, 4):
            self.cids.append(
                create_clip(name='test_clip{}'.format(i), fid=self.fid, video_format='tvf', latitude=Decimal('0.0'),
                            longitude=Decimal('0.0'), start_time=self.st + timezone.timedelta(seconds=2 * i - 3),
                            end_time=self.et + timezone.timedelta(seconds=2 * i - 3),
                            width=256, height=240, frame_rate=42))
        self.od = ObjectDetector()
        self.pid = create_progress(total=len(self.cids))

    @patch('backend.object_detector.replace_sep', side_effect= lambda x: x)
    @patch('backend.object_detector.ObjectDetector.detect')
    def test_basic(self, mock_detect, mock_replace_sep):
        """
        Make a simple call.
        """
        mock_detect.return_value = [('monkey', 1), ('frog', 2)]
        self.od.run_object_detection(cids=self.cids, pid=self.pid, rate=1, start_time=self.st, end_time=self.et)
        self.assertEqual(mock_detect.call_count, 3)
        mock_detect.assert_has_calls([call(clip='home/user/test_folder/test_clip1.tvf', rate=1, start=1, end=5),
                                      call(clip='home/user/test_folder/test_clip2.tvf', rate=1, start=0, end=4),
                                      call(clip='home/user/test_folder/test_clip3.tvf', rate=1, start=0, end=2)])
        self.assertEqual(get_progress_by_id(pid=self.pid).current, 3)
        for i in range(1, 4):
            objects = get_objects_in_detection(odid=1)
            self.assertEqual(str(objects[0].object_class), 'monkey')
            self.assertEqual(str(objects[1].object_class), 'frog')