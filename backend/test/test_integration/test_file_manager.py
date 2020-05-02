from django.test import TestCase
from unittest.mock import patch

# Import module
from backend.file_manager import *


class GetSourceFolders(TestCase):

    def setUp(self) -> None:
        """
        Set up a complex file structure.
        """
        self.rid = create_root_folder(path='home/user/', name='test_folder')
        self.sid1 = create_subfolder(parent_fid=self.rid, name='test_subfolder')
        self.sid2 = create_subfolder(parent_fid=self.rid, name='another_test_subfolder')
        self.sid3 = create_subfolder(parent_fid=self.sid1, name='third_test_subfolder')
        self.pid = create_project(name="test_project")
        add_folder_to_project(self.sid1, self.pid)

    def test_basic_call(self):
        """
        Test simple call.
        """
        code, res = get_source_folders(data={PROJECT_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(len(res[FOLDERS]), 2)
        self.assertEqual(len(res[FOLDER_IDS]), 1)


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

    def setUp(self) -> None:
        """
        Setup a test project.
        """
        self.pid = create_project('test_project')
        self.fid = create_root_folder(path='home/user/', name='test_folder')

    def test_simple_call(self):
        """
        Test adding a folder to a project.
        """
        code, res = add_folder({PROJECT_ID: self.pid, FOLDER_ID: self.fid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {FOLDERS: [], FOLDER_IDS: []})

    def test_bad_file_path(self):
        """
        Test with a bad file path.
        """
        code, res = add_folder({FILE_PATH: 'test_folder'})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = add_folder(data={PROJECT_ID: 42, FOLDER_ID: self.fid})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})

    def test_non_existing_folder(self):
        """
        Test with a folder id that doesn't exist.
        """
        code, res = add_folder(data={PROJECT_ID: self.pid, FOLDER_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class RemoveFoldersTest(TestCase):

    def setUp(self) -> None:
        """
        Setup a test project.
        """
        self.pid = create_project('test_project')
        self.fid = create_root_folder(path='home/user/', name='test_folder')

    def test_simple_call(self):
        """
        Test removing a folder from a project.
        """
        code, res = remove_folder({PROJECT_ID: self.pid, FOLDER_ID: self.fid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {FOLDERS: [], FOLDER_IDS: []})

    def test_bad_file_path(self):
        """
        Test with a bad file path.
        """
        code, res = remove_folder({FILE_PATH: 'test_folder'})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = remove_folder(data={PROJECT_ID: 42, FOLDER_ID: self.fid})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})

    def test_non_existing_folder(self):
        """
        Test with a folder id that doesn't exist.
        """
        code, res = remove_folder(data={PROJECT_ID: self.pid, FOLDER_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class GetClipsTest(TestCase):

    @patch('backend.database_wrapper.create_hash_sum')
    def setUp(self, mock_create_hash_sum) -> None:
        """
        Setup a test project.
        """
        mock_create_hash_sum.return_value = '1234'
        self.cam_name = 'test_camera'
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))

        self.pid = create_project(name="test_project")
        self.rid = create_root_folder(path='home/user/', name='test_folder')
        self.sid1 = create_subfolder(parent_fid=self.rid, name='test_subfolder')
        self.sid2 = create_subfolder(parent_fid=self.rid, name='another_test_subfolder')
        self.sid3 = create_subfolder(parent_fid=self.sid1, name='third_test_subfolder')
        self.cid1 = create_clip(fid=self.rid, clip_name="test_clip1", video_format="tvf", start_time=self.st,
                                end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                frame_rate=42.0, camera_name=self.cam_name)
        self.cid2 = create_clip(fid=self.sid1, clip_name="test_clip2", video_format="tvf", start_time=self.st,
                                end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                frame_rate=42.0, camera_name=self.cam_name)
        self.cid3 = create_clip(fid=self.sid3, clip_name="test_clip3", video_format="tvf", start_time=self.st,
                                end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                frame_rate=42.0, camera_name=self.cam_name)
        add_folder_to_project(fid=self.rid, pid=self.pid)

    def test_complex_file_structure(self):
        """
        Test retrieving all clips in a project.
        """
        code, res = get_clips(data={PROJECT_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(len(res[CLIPS]), 3)

    def test_no_clips_in_project(self):
        """
        Test when there are no clips in project.
        """
        pid = create_project(name="test_project2")
        code, res = get_clips(data={PROJECT_ID: pid})
        self.assertEqual(code, 200)
        self.assertEqual(len(res[CLIPS]), 0)

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = get_clips(data={PROJECT_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})

    def test_bad_request(self):
        """
        Test with bad request.
        """
        code, res = get_clips(data={FOLDER_ID: self.pid})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})
