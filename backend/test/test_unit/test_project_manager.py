from django.test import TestCase

# Import module
from backend.project_manager import *

class GetProjectsTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the get_projects function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = get_projects({})
        self.assertEqual(res[0], 200)

class SaveProjectTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the save_project function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = save_project({})
        self.assertEqual(res[0], 200)

class OpenProjectTest(TestCase):

    def test_simple_call(self):
        """
        Makes a simple call to the open_project function.
        This test will probably be refactored in the future.
        :return: None
        """
        res = open_project({})
        self.assertEqual(res[0], 200)
