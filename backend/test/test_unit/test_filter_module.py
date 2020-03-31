from django.test import TestCase

# Import module
from backend.filter_module import *

class FilterClipsTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the filter_clips function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = filter_clips({})
        self.assertEqual(res[0], 200)
