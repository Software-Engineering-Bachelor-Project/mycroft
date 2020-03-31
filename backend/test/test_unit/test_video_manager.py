from django.test import TestCase

# Import module
from backend.video_manager import *

class GetClipInfoTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the get_clip_info function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = get_clip_info({})
        self.assertEqual(res[0], 200)


class GetClipStreamTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the get_clip_stream function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = get_clip_stream({})
        self.assertEqual(res[0], 200)
