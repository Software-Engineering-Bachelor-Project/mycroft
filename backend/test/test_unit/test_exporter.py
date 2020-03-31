from django.test import TestCase

# Import module
from backend.exporter import *

class ExportFilterTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the export_filter function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = export_filter({})
        self.assertEqual(res[0], 200)


class ExportClipsTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the export_clips function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = export_clips({})
        self.assertEqual(res[0], 200)
