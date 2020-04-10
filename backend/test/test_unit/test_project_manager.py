from django.test import TestCase
from unittest.mock import patch

# Import module
from backend.project_manager import *


class GetProjectsTest(TestCase):

    @patch('backend.project_manager.os_aware')
    @patch('backend.project_manager.serialize')
    @patch('backend.project_manager.get_all_projects')
    def test_basic(self, mock_get_all_projects, mock_serialize, mock_os_aware):
        """
        Makes a simple call.
        """
        mock_get_all_projects.return_value = 'return from get all projects'
        mock_serialize.return_value = 'return from serialize'
        code, res = get_projects({})
        self.assertEqual(code, 200)
        mock_get_all_projects.assert_called_once()
        mock_serialize.assert_called_once_with('return from get all projects')
        mock_os_aware.assert_called_once_with({PROJECTS: 'return from serialize'})


class NewProjectTest(TestCase):

    @patch('backend.project_manager.create_filter')
    @patch('backend.project_manager.create_project')
    def test_basic(self, mock_create_project, mock_create_filter):
        """
        Makes a simple call.
        """
        mock_create_project.return_value = 42
        code, res = new_project(data={PROJECT_NAME: 'test_project'})
        mock_create_project.assert_called_once_with(name='test_project')
        mock_create_filter.assert_called_once_with(pid=42)
        self.assertEqual(code, 200)
        self.assertEqual(res, {PROJECT_ID: 42})

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = new_project(data={CLIP_NAME: 'clip_name'})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class DeleteProjectTest(TestCase):

    @patch('backend.project_manager.db_delete_project')
    def test_basic(self, mock_delete_project):
        """
        Makes a simple call.
        """
        code, res = delete_project(data={PROJECT_ID: 42})
        mock_delete_project.assert_called_once_with(pid=42)
        self.assertEqual(code, 200)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = new_project(data={FOLDER_ID: 42})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class RenameProjectTest(TestCase):

    @patch('backend.project_manager.db_rename_project')
    def test_basic(self, mock_rename_project):
        """
        Makes a simple call.
        """
        code, res = rename_project(data={PROJECT_ID: 42, PROJECT_NAME: 'new_name'})
        mock_rename_project.assert_called_once_with(pid=42, new_name='new_name')
        self.assertEqual(code, 200)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = new_project(data={PROJECT_ID: 42})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})
