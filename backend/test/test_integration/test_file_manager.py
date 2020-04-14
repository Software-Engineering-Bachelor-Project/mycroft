from django.test import TestCase
from unittest.mock import patch

# Import module
from backend.file_manager import *


class GetFoldersTest(TestCase):

    def setUp(self) -> None:
        """
        Set up a complex file structure.
        """
        self.pid = create_project(name="test_project")
        self.rid = create_root_folder(path='home/user/', name='test_folder')
        self.sid1 = create_subfolder(parent_fid=self.rid, name='test_subfolder')
        self.sid2 = create_subfolder(parent_fid=self.rid, name='another_test_subfolder')
        self.sid3 = create_subfolder(parent_fid=self.sid1, name='third_test_subfolder')
        add_folder_to_project(fid=self.rid, pid=self.pid)

    def test_complex_file_structure(self):
        """
        Test with a complex file structure.
        """
        code, res = get_folders(data={PROJECT_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(len(res[FOLDERS]), 4)

    def test_redundant_parameter(self):
        """
        Test with a redundant parameter.
        """
        code, res = get_folders(data={PROJECT_ID: self.pid, FOLDER_ID: 42})
        self.assertEqual(code, 200)
        self.assertEqual(len(res[FOLDERS]), 4)


class AddFoldersTest(TestCase):
    # Need to mock OS dependent function calls.

    def setUp(self) -> None:
        """
        Setup a test project.
        """
        self.pid = create_project('test_project')

    @patch('backend.file_manager.traverse_subfolders')
    @patch('os.path')
    def test_simple_call(self, mock_os_path, mock_traverse_subfolders):
        """
        Test adding a folder to a project.
        """
        mock_os_path.sep = '/'
        mock_os_path.join.return_value = 'home/user/'
        code, res = add_folder({PROJECT_ID: self.pid, FILE_PATH: 'home/user/test_folder'})
        mock_traverse_subfolders.assert_called_once_with(path='home/user/test_folder', parent_id=1)
        self.assertEqual(code, 200)
        self.assertEqual(res, {FOLDER_ID: 1})

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = add_folder({FILE_PATH: 'home/user/test_folder'})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})

    def test_bad_file_path(self):
        """
        Test with a bad file path.
        """
        code, res = add_folder({FILE_PATH: 'test_folder'})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})

    @patch('backend.file_manager.build_file_structure')
    def test_non_existing_project(self, mock_build_file_structure):
        """
        Test with a project id that doesn't exist.
        """
        mock_build_file_structure.return_value = 1337
        code, res = add_folder(data={PROJECT_ID: 42, FILE_PATH: 'home/user/test_folder'})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})
