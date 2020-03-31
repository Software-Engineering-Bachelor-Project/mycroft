from django.test import TestCase

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
