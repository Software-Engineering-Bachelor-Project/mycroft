from django.test import TestCase
from django.urls import reverse, resolve
from backend.views import *

class UrlsTest(TestCase):

    def test_filter(self):
        '''
        Test that the url for the filter module is correctly mapped to the view
        :return: None
        '''
        url = reverse('backend:filter')
        resolver = resolve(url)
        self.assertEqual(resolver.func, filter)

    def test_project_get_all(self):
        '''
        Test that the url for the project_get_all module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project get all')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_get_all)

    def test_project_save(self):
        '''
        Test that the url for the project_save module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project save')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_save)

    def test_project_open(self):
        '''
        Test that the url for the project_open module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project open')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_open)

    def test_export_filter(self):
        '''
        Test that the url for the export_filter module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:export filter')
        resolver = resolve(url)
        self.assertEqual(resolver.func, export_filter)

    def test_export_videos(self):
        '''
        Test that the url for the export_video module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:export videos')
        resolver = resolve(url)
        self.assertEqual(resolver.func, export_videos)

    def test_video_get_info(self):
        '''
        Test that the url for the video_get_info module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:video info')
        resolver = resolve(url)
        self.assertEqual(resolver.func, video_get_info)

    def test_video_get_stream(self):
        '''
        Test that the url for the video_get_stream module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:video stream')
        resolver = resolve(url)
        self.assertEqual(resolver.func, video_get_stream)

    def test_file_get_folders(self):
        '''
        Test that the url for the file_get_folders module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:file get folders')
        resolver = resolve(url)
        self.assertEqual(resolver.func, file_get_folders)

    def test_file_add_folder(self):
        '''
        Test that the url for the file_add_folder module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:file add')
        resolver = resolve(url)
        self.assertEqual(resolver.func, file_add_folders)

    def test_object_detection(self):
        '''
        Test that the url for the object_detection module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:detect objects')
        resolver = resolve(url)
        self.assertEqual(resolver.func, detect_objects)
