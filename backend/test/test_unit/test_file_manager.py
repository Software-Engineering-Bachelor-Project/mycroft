from django.test import TestCase

# Import module
from backend.file_manager import *

class GetFoldersTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the get_folders function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = get_folders({})
        self.assertEqual(res[0], 200)


class AddFoldersTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the add_folders function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = add_folders({})
        self.assertEqual(res[0], 200)
