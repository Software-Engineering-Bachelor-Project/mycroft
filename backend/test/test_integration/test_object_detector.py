from django.test import TestCase
from unittest.mock import patch

# Import module
from backend.object_detector import *


class DetectObjectsTest(TestCase):

    def test_basic(self):
        """
        Make a simple call.
        """
        detect_objects(data={CLIP_IDS: []})


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
