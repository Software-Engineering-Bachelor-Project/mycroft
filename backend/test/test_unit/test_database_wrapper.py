from django.test import TestCase
from backend.database_wrapper import *

from unittest.mock import patch


class CreateProjectTest(TestCase):

    @patch('backend.models.Project.objects')
    def test_database_call(self, mock_project):
        """
        Tests that the fuction call the correct function in the database and that the id of the created object is
        returned
        """
        res = create_project('Test')

        mock_project.create.assert_called_with(name='Test')
        self.assertEqual(res, mock_project.create().id)


class GetProjectByIdTest(TestCase):

    @patch('backend.models.Project.objects')
    def test_existing_id(self, mock_project):
        """
        Tests that the correct function is called in the database and that the project is returned
        """
        pid = 1
        res = get_project_by_id(pid)
        mock_project.get.assert_called_with(id=pid)
        self.assertEqual(res, mock_project.get())

    @patch('backend.models.Project.objects.get', side_effect=Project.DoesNotExist())
    def test_nonexisting_id(self, mock_project):
        """
        Tests that None is returned if the pid is not found
        """
        pid = 1
        res = get_project_by_id(pid)
        mock_project.assert_called_with(id=pid)
        self.assertEqual(res, None)


class GetProjectByNameTest(TestCase):

    @patch('backend.models.Project.objects')
    def test_name(self, mock_project):
        """
        Tests that the correct function is called in the database and that the first project is returned
        """
        name = "Test"
        res = get_project_by_name(name)
        mock_project.filter.assert_called_with(name=name)
        self.assertEqual(res, mock_project.filter().first())


class GetAllProjectsTest(TestCase):
    @patch('backend.models.Project.objects')
    def test_all(self, mock_project):
        """
        Tests that the correct function is called in the database and that all projects is returned
        """
        res = get_all_projects()
        mock_project.all.assert_called()
        self.assertEqual(res, mock_project.all()[::1])


class DeleteProjectTest(TestCase):
    @patch('backend.models.Project.objects')
    def test_existing_pid(self, mock_project):
        pid = 1
        delete_project(pid)
        mock_project.get().delete.assert_called()


class RenameProjectTest(TestCase):

    @patch('backend.database_wrapper.get_project_by_id')
    def test_existing_pid(self, mock_project):
        """
        Test that the project with the given pid is renamed and saved to the database
        """
        pid = 1
        new_name = "Test"
        rename_project(new_name, pid)
        mock_project.return_value.save.assert_called()
        self.assertEqual(mock_project.return_value.name, new_name)


class AddFolderToProjectTest(TestCase):

    @patch('backend.database_wrapper.get_folder_by_id')
    @patch('backend.database_wrapper.get_folder_by_id')
    def test_existing_pid(self, mock_folder, mock_project):
        """
        Chenck that the folder has been added to the
        projekt
        """
        # Todo
        self.assertTrue(True)


class DeleteFolderFromProjectTest(TestCase):

    def existing_fid_existing_pid(self):
        fid = 1
        pid = 2

        delete_folder_from_project(fid, pid)


'''

class GetFoldersInProjectTest(TestCase):

class GetAllFiltersFromProjectTest(TestCase):

class CreateRootFolderTest(TestCase):

class CreateSubFolderTest(TestCase):

class GetFolderByIdTest(TestCase):

class GetFolderByPathTest(TestCase):

class FolderByParentTest(TestCase):

class GetSubFoldersTest(TestCase):

class GetSubFoldersRecursiveTest(TestCase):

class DeleteFolderTest(TestCase):

class CreateClipTest(TestCase):

class GetClipByIdTest(TestCase):

class GetClipByNameTest(TestCase):

class DeleteClipTest(TestCase):

class GetAllClipsFromFolderTest(TestCase):

class GetAllClipsFromFolderRecursiveTest(TestCase):

class GetCameraByIDTest(TestCase):

class GetCameraByLocationTest(TestCase):

class DeleteCameraTest(TestCase):

class GetObjectsInCameraTest(TestCase):

class CreateFilterTest(TestCase):

class GetFilterByIdTest(TestCase):

class DeleteFilterTest(TestCase):

class AddCameraToFilterTest(TestCase):

class RemoveCameraFromFilterTest(TestCase):

class GetAllCamerasInFilterTest(TestCase):

class ModifyFilterTest(TestCase):

class GetAllClasssesInFilterTest(TestCase):

class CreateObjectDetectionTest(TestCase):

class GetObjectDetectionByIDTest(TestCase):

class DeleteObjectDetectionTest(TestCase):

class AddObjectsToDetectionTest(TestCase):

class GetObjectsInDetectionTest(TestCase):
'''
