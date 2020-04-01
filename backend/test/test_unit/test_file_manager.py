from unittest.mock import patch

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


class BuildFileStructureTest(TestCase):

    @patch('backend.file_manager.create_root_folder')
    @patch('backend.file_manager.traverse_subfolders')
    @patch('os.path')
    def test_function(self, mock_os_path, mock_traverse_subfolders, mock_create_root_folder):
        """
        Test that a function for create_root_folder and traverse_folder is called with appropriate arguments.
        """
        mock_os_path.sep = '/'
        mock_os_path.join.return_value = 'home/user/'
        mock_traverse_subfolders.return_value = None
        mock_create_root_folder.return_value = 1337

        build_file_structure('home/user/test_folder')
        mock_create_root_folder.assert_called_with(path='home/user/', name='test_folder')
        mock_traverse_subfolders.assert_called_with(path='home/user/test_folder', parent_id=1337)


class TraverseSubfoldersTest(TestCase):
    # Hard to test because behavior is dependent on OS.

    @patch('os.scandir')
    def test_function(self, mock_os_scandir):
        """
        Test that scandir is called with correct argument.
        """
        mock_os_scandir.return_value = []
        traverse_subfolders(path='home/user/test_folder', parent_id=1337)
        mock_os_scandir.assert_called_with('home/user/test_folder')


class GetClipInfoTest(TestCase):

    def test_something(self):
        pass


class AnalyzeFileTest(TestCase):

    def test_get_name(self):
        """
        Test getting the name from a file (str).
        """
        self.assertEqual(analyze_file(file='filename.suffix')[1], 'filename')

    def test_get_suffix(self):
        """
        Test getting the suffix from a file (str).
        """
        self.assertEqual(analyze_file(file='filename.suffix')[2], 'suffix')

    def test_bad_file(self):
        """
        Test that ValueError is raised when a bad file is given.
        """
        self.assertRaises(ValueError, analyze_file, file='filename_no_suffix')

    def test_is_clip(self):
        """
        Test checking if a file is a clip.
        """
        for vf in VIDEO_FORMATS:
            self.assertTrue(analyze_file(file='filename.{0}'.format(vf))[0])
        self.assertFalse(analyze_file(file='filename.fake')[0])
