from django.test import TestCase
from django.http import QueryDict
from rest_framework.test import APIRequestFactory
import unittest.mock as mock

import backend.views as views


class FilterCreateArea(TestCase):

    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter create area' request.
        :return: None
        '''
        # Set up mock
        mock_mod.create_area.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter_create_area(req)

        # Did we propagate properly?
        mock_mod.create_area.assert_called_with(QueryDict('test=data'))


class FilterGetAreas(TestCase):

    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter get areas' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_areas_in_filter.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter_get_areas(req)

        # Did we propagate properly?
        mock_mod.get_areas_in_filter.assert_called_with(QueryDict('test=data'))


class FilterGetParams(TestCase):
    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter get params' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_params.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter_get_params(req)

        # Did we propagate properly?
        mock_mod.get_params.assert_called_with(QueryDict('test=data'))


class FilterCreateArea(TestCase):

    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter create area' request.
        :return: None
        '''
        # Set up mock
        mock_mod.create_area.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter_create_area(req)

        # Did we propagate properly?
        mock_mod.create_area.assert_called_with(QueryDict('test=data'))


class FilterModifyTest(TestCase):

    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter modify' request.
        :return: None
        '''
        # Set up mock
        mock_mod.modify_filter.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter_modify(req)

        # Did we propagate properly?
        mock_mod.modify_filter.assert_called_with(QueryDict('test=data'))


class FilterGetMatchingClipsTest(TestCase):

    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter get matching clips' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_clips_matching_filter.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter_get_matching_clips(req)

        # Did we propagate properly?
        mock_mod.get_clips_matching_filter.assert_called_with(QueryDict('test=data'))


class ProjectGetAllTest(TestCase):

    @mock.patch('backend.views.project_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get projects' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_projects.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.project_get_all(req)

        # Did we propagate properly?
        mock_mod.get_projects.assert_called_with(QueryDict('test=data'))


class ProjectNewTest(TestCase):

    @mock.patch('backend.views.project_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'new project' request.
        :return: None
        '''
        # Set up mock
        mock_mod.new_project.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.project_new(req)

        # Did we propagate properly?
        mock_mod.new_project.assert_called_with(QueryDict('test=data'))


class ProjectDeleteTest(TestCase):

    @mock.patch('backend.views.project_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'delete project' request.
        :return: None
        '''
        # Set up mock
        mock_mod.delete_project.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.project_delete(req)

        # Did we propagate properly?
        mock_mod.delete_project.assert_called_with(QueryDict('test=data'))


class ProjectRenameTest(TestCase):

    @mock.patch('backend.views.project_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'rename project' request.
        :return: None
        '''
        # Set up mock
        mock_mod.rename_project.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.project_rename(req)

        # Did we propagate properly?
        mock_mod.rename_project.assert_called_with(QueryDict('test=data'))


class ExportFilterTest(TestCase):

    @mock.patch('backend.views.exporter')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'export filter' request.
        :return: None
        '''
        # Set up mock
        mock_mod.export_filter.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.export_filter(req)

        # Did we propagate properly?
        mock_mod.export_filter.assert_called_with(QueryDict('test=data'))


class ExportClipsTest(TestCase):

    @mock.patch('backend.views.exporter')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'export clips' request.
        :return: None
        '''
        # Set up mock
        mock_mod.export_clips.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.export_clips(req)

        # Did we propagate properly?
        mock_mod.export_clips.assert_called_with(QueryDict('test=data'))


class VideoGetInfoTest(TestCase):

    @mock.patch('backend.views.video_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get clip info' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_clip_info.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.video_get_info(req)

        # Did we propagate properly?
        mock_mod.get_clip_info.assert_called_with(QueryDict('test=data'))


class VideoGetSequentialTest(TestCase):

    @mock.patch('backend.views.video_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get sequential clip' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_sequential_clip.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.video_get_sequential(req)

        # Did we propagate properly?
        mock_mod.get_sequential_clip.assert_called_with(QueryDict('test=data'))


class VideoGetCamerasTest(TestCase):

    @mock.patch('backend.views.video_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get clip stream' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_cameras.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.video_get_cameras(req)

        # Did we propagate properly?
        mock_mod.get_cameras.assert_called_with(QueryDict('test=data'))


class FileGetSourceFoldersTest(TestCase):

    @mock.patch('backend.views.file_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get  source folders' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_source_folders.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.file_get_source_folders(req)

        # Did we propagate properly?
        mock_mod.get_source_folders.assert_called_with(QueryDict('test=data'))


class FileGetFoldersTest(TestCase):

    @mock.patch('backend.views.file_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get folders' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_folders.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.file_get_folders(req)

        # Did we propagate properly?
        mock_mod.get_folders.assert_called_with(QueryDict('test=data'))


class FileAddFoldersTest(TestCase):

    @mock.patch('backend.views.file_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'add folders' request.
        :return: None
        '''
        # Set up mock
        mock_mod.add_folder.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.file_add_folder(req)

        # Did we propagate properly?
        mock_mod.add_folder.assert_called_with(QueryDict('test=data'))


class FileRemoveFoldersTest(TestCase):

    @mock.patch('backend.views.file_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'remove folders' request.
        :return: None
        '''
        # Set up mock
        mock_mod.remove_folder.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.file_remove_folder(req)

        # Did we propagate properly?
        mock_mod.remove_folder.assert_called_with(QueryDict('test=data'))


class FileGetClipsTest(TestCase):

    @mock.patch('backend.views.file_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get clips' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_clips.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.file_get_clips(req)

        # Did we propagate properly?
        mock_mod.get_clips.assert_called_with(QueryDict('test=data'))


class DetectObjectsTest(TestCase):

    @mock.patch('backend.views.object_detector')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'detect objects' request.
        :return: None
        '''
        # Set up mock
        mock_mod.detect_objects.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.detect_objects(req)

        # Did we propagate properly?
        mock_mod.detect_objects.assert_called_with(QueryDict('test=data'))


class GetProgressTest(TestCase):

    @mock.patch('backend.views.object_detector')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get progress' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_progress.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.get_progress(req)

        # Did we propagate properly?
        mock_mod.get_progress.assert_called_with(QueryDict('test=data'))


class DeleteProgressTest(TestCase):

    @mock.patch('backend.views.object_detector')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'delete progress' request.
        :return: None
        '''
        # Set up mock
        mock_mod.delete_progress.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.delete_progress(req)

        # Did we propagate properly?
        mock_mod.delete_progress.assert_called_with(QueryDict('test=data'))
