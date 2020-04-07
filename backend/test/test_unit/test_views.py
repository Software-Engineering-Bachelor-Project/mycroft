from django.test import TestCase
from django.http import QueryDict
from rest_framework.test import APIRequestFactory
import unittest.mock as mock

import backend.views as views

class FilterTest(TestCase):

    @mock.patch('backend.views.filter_module')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'filter clips' request.
        :return: None
        '''
        # Set up mock
        mock_mod.filter_clips.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.filter(req)
        
        # Did we propagate properly?
        mock_mod.filter_clips.assert_called_with(QueryDict('test=data'))


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


class ProjectSaveTest(TestCase):

    @mock.patch('backend.views.project_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'save project' request.
        :return: None
        '''
        # Set up mock
        mock_mod.save_project.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.project_save(req)
        
        # Did we propagate properly?
        mock_mod.save_project.assert_called_with(QueryDict('test=data'))


class ProjectOpenTest(TestCase):

    @mock.patch('backend.views.project_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'open project' request.
        :return: None
        '''
        # Set up mock
        mock_mod.open_project.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.project_open(req)
        
        # Did we propagate properly?
        mock_mod.open_project.assert_called_with(QueryDict('test=data'))


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


class VideoGetStreamTest(TestCase):

    @mock.patch('backend.views.video_manager')
    def test_propagation(self, mock_mod):
        '''
        Tests propagation of the 'get clip stream' request.
        :return: None
        '''
        # Set up mock
        mock_mod.get_clip_stream.return_value = (200, {})

        # Test function
        req = APIRequestFactory().post('', {'test': 'data'})
        response = views.video_get_stream(req)
        
        # Did we propagate properly?
        mock_mod.get_clip_stream.assert_called_with(QueryDict('test=data'))


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
