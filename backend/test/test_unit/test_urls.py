from django.test import TestCase
from django.urls import reverse, resolve
from backend.views import *


class UrlsTest(TestCase):

    def test_filter_get_matching_clips(self):
        '''
        Test that the url for the filter module is correctly mapped to the view
        :return: None
        '''
        url = reverse('backend:filter get matching')
        resolver = resolve(url)
        self.assertEqual(resolver.func, filter_get_matching_clips)

    def test_filter_modify(self):
        '''
        Test that the url for the filter module is correctly mapped to the view
        :return: None
        '''
        url = reverse('backend:filter modify')
        resolver = resolve(url)
        self.assertEqual(resolver.func, filter_modify)

    def test_project_get_all(self):
        '''
        Test that the url for the project_get_all module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project get all')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_get_all)

    def test_project_new(self):
        '''
        Test that the url for the project_new module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project new')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_new)

    def test_project_delete(self):
        '''
        Test that the url for the project_delete module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project delete')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_delete)

    def test_project_rename(self):
        '''
        Test that the url for the project_rename module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:project rename')
        resolver = resolve(url)
        self.assertEqual(resolver.func, project_rename)

    def test_export_filter(self):
        '''
        Test that the url for the export_filter module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:export filter')
        resolver = resolve(url)
        self.assertEqual(resolver.func, export_filter)

    def test_export_clips(self):
        '''
        Test that the url for the export_clips module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:export clips')
        resolver = resolve(url)
        self.assertEqual(resolver.func, export_clips)

    def test_video_get_info(self):
        '''
        Test that the url for the video_get_info module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:video info')
        resolver = resolve(url)
        self.assertEqual(resolver.func, video_get_info)

    def test_video_get_cameras(self):
        '''
        Test that the url for the video_get_stream module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:video get cameras')
        resolver = resolve(url)
        self.assertEqual(resolver.func, video_get_cameras)

    def test_file_get_folders(self):
        '''
        Test that the url for the file_get_folders module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:file get folders')
        resolver = resolve(url)
        self.assertEqual(resolver.func, file_get_folders)

    def test_file_add_folders(self):
        '''
        Test that the url for the file_add_folders module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:file add folder')
        resolver = resolve(url)
        self.assertEqual(resolver.func, file_add_folder)

    def test_object_detection(self):
        '''
        Test that the url for the object_detection module is correctly mapped to the view
        :return: None
        '''

        url = reverse('backend:detect objects')
        resolver = resolve(url)
        self.assertEqual(resolver.func, detect_objects)
