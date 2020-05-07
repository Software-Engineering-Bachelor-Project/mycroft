from unittest.mock import patch, mock_open
from django.test import TestCase

# Import module
from backend.file_manager import *

METADATA_EXAMPLE = "59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)\n2018-09-06 15:45:59.603     " \
                   "(2018-09-06 15:45:59)\n(Test camera name)"


class GetSourceFolders(TestCase):

    def setUp(self) -> None:
        """
        Set up a complex file structure.
        """
        self.rf = Folder.objects.create(path='home/user/', name='test_folder')
        self.sf = Folder.objects.create(path='home/user/test_folder/', name='test_subfolder')
        self.p = Project.objects.create(name="test_project")

    @patch('backend.file_manager.get_subfolders_to_entries')
    def test_basic_call(self, mock_get_subfolders_to_entries):
        """
        Test simple call.
        """
        mock_get_subfolders_to_entries.return_value = [self.sf]
        code, res = get_source_folders(data={PROJECT_ID: self.p.id})
        mock_get_subfolders_to_entries.assert_called_once()
        self.assertEqual(code, 200)
        self.assertEqual(len(res[FOLDERS]), 1)
        self.assertEqual(len(res[FOLDER_IDS]), 0)


class GetFoldersTest(TestCase):

    def setUp(self) -> None:
        """
        Set up a complex file structure.
        """
        self.rf = Folder.objects.create(path='home/user/', name='test_folder')
        self.sf = Folder.objects.create(path='home/user/test_folder/', name='test_subfolder')

    @patch('backend.file_manager.get_subfolders_recursive')
    @patch('backend.file_manager.get_folders_in_project')
    def test_basic_call(self, mock_get_folders_in_project, mock_get_subfolders_recursive):
        """
        Test with a complex file structure.
        """
        mock_get_folders_in_project.return_value = [self.rf]
        mock_get_subfolders_recursive.return_value = [self.sf]
        code, res = get_folders(data={PROJECT_ID: 1})
        mock_get_folders_in_project.assert_called_once_with(pid=1)
        mock_get_subfolders_recursive.assert_called_once_with(fid=self.rf.id)
        self.assertEqual(code, 200)
        self.assertEqual(len(res[FOLDERS]), 2)

    @patch('backend.file_manager.get_subfolders_recursive')
    @patch('backend.file_manager.get_folders_in_project')
    def test_redundant_parameter(self, mock_get_folders_in_project, mock_get_subfolders_recursive):
        """
        Test with a redundant parameter.
        """
        mock_get_folders_in_project.return_value = [self.rf]
        mock_get_subfolders_recursive.return_value = [self.sf]
        code, res = get_folders(data={PROJECT_ID: 1, FOLDER_ID: 42})
        mock_get_folders_in_project.assert_called_once_with(pid=1)
        mock_get_subfolders_recursive.assert_called_once_with(fid=self.rf.id)
        self.assertEqual(code, 200)
        self.assertEqual(len(res[FOLDERS]), 2)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = get_folders(data={FOLDER_ID: 42})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = get_folders(data={PROJECT_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class AddFoldersTest(TestCase):

    @patch('backend.file_manager.get_source_folders')
    @patch('backend.file_manager.add_folder_to_project')
    def test_simple_call(self, mock_add_folder_to_project, mock_get_source_folders):
        """
        Test adding a folder to a project.
        """
        res = add_folder({PROJECT_ID: 42, FOLDER_ID: 1337})
        mock_add_folder_to_project.assert_called_once_with(fid=1337, pid=42)
        mock_get_source_folders.assert_called_once_with(data={PROJECT_ID: 42, FOLDER_ID: 1337})
        self.assertEqual(res, mock_get_source_folders.return_value)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = add_folder({FOLDER_ID: 1337})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class RemoveFoldersTest(TestCase):

    @patch('backend.file_manager.get_source_folders')
    @patch('backend.file_manager.delete_folder_from_project')
    def test_simple_call(self, mock_delete_folder_from_project, mock_get_source_folders):
        """
        Test removing a folder to a project.
        """
        res = remove_folder({PROJECT_ID: 42, FOLDER_ID: 1337})
        mock_delete_folder_from_project.assert_called_once_with(fid=1337, pid=42)
        mock_get_source_folders.assert_called_once_with(data={PROJECT_ID: 42, FOLDER_ID: 1337})
        self.assertEqual(res, mock_get_source_folders.return_value)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = remove_folder({FOLDER_ID: 1337})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})


class GetClipsTest(TestCase):

    def setUp(self) -> None:
        """
        Set up a file structure.
        """
        self.resolution = Resolution.objects.get_or_create(width=256, height=240)[0]
        self.cm_name = 'Test camera name'
        self.lon = Decimal('0.42')
        self.lat = Decimal('42.0')
        self.st = timezone.datetime(2020, 1, 17, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(2020, 1, 18, tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.rf = Folder.objects.create(path='home/user/', name='test_folder')
        self.ca = Camera.objects.create(name=self.cm_name, longitude=self.lon, latitude=self.lat)
        self.cl = Clip.objects.create(folder=self.rf, name='test_clip', video_format='mkv', start_time=self.st,
                                      end_time=self.et, camera=self.ca, frame_rate=42.0, resolution=self.resolution)

    @patch('backend.file_manager.get_all_clips_in_project')
    def test_basic_call(self, mock_get_all_clips_in_project):
        """
        Test with a complex file structure.
        """
        mock_get_all_clips_in_project.return_value = [self.cl]
        code, res = get_clips(data={PROJECT_ID: 1})

        mock_get_all_clips_in_project.assert_called_once_with(pid=1)
        self.assertEqual(code, 200)
        self.assertEqual(len(res[CLIPS]), 1)

    def test_missing_parameter(self):
        """
        Test with a missing parameter.
        """
        code, res = get_clips(data={})
        self.assertEqual(code, 400)
        self.assertEqual(res, {})

    def test_non_existing_project(self):
        """
        Test with a project id that doesn't exist.
        """
        code, res = get_clips(data={PROJECT_ID: 42})
        self.assertEqual(code, 204)
        self.assertEqual(res, {})


class BuildFileStructureTest(TestCase):

    @patch('backend.file_manager.create_root_folder')
    @patch('backend.file_manager.traverse_subfolders')
    @patch('backend.file_manager.os.path.isdir')
    @patch('backend.file_manager.os.path.dirname')
    @patch('backend.file_manager.os.path.basename')
    def test_function(self, mock_basename, mock_dirname, mock_isdir, mock_traverse_subfolders, mock_create_root_folder):
        """
        Test that a function for create_root_folder and traverse_folder is called with appropriate arguments.
        """
        mock_basename.return_value = 'test_folder'
        mock_dirname.return_value = 'home/user'
        mock_isdir.return_value = True
        mock_traverse_subfolders.return_value = None
        mock_create_root_folder.return_value = 1337

        build_file_structure('home/user/test_folder')
        mock_isdir.assert_called_once_with('home/user/test_folder')
        mock_create_root_folder.assert_called_once_with(path='home/user/', name='test_folder')
        mock_traverse_subfolders.assert_called_once_with(path='home/user/test_folder', parent_id=1337)


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


class GetClipInfoTest(TestCase):

    def setUp(self) -> None:
        self.cm_name = 'Test camera name'
        self.lat = Decimal('42.0')
        self.lon = Decimal('0.42')
        self.st = timezone.datetime(year=2018, month=9, day=6, hour=15, minute=45, second=59,
                                    tzinfo=pytz.timezone(settings.TIME_ZONE))
        self.et = timezone.datetime(year=2018, month=9, day=6, hour=15, minute=46, second=41,
                                    tzinfo=pytz.timezone(settings.TIME_ZONE))  # duration = 42

    @patch('backend.file_manager.get_clip_details')
    @patch('backend.file_manager.parse_metadata')
    def test_valid_clip(self, mock_parse_metadata, mock_get_clip_details):
        """
        Test with valid clip.
        """
        mock_parse_metadata.return_value = (self.lat, self.lon, self.st, self.cm_name)
        mock_get_clip_details.return_value = (42, 1337, 256, 240)
        res = get_clip_info(file_path='home/user/test_folder/test_clip.avi', folder_id=1337, name='test_clip',
                            video_format='avi')
        self.assertEqual(res, {'fid': 1337, 'clip_name': 'test_clip', 'video_format': 'avi', 'start_time': self.st,
                               'end_time': self.et, 'latitude': self.lat, 'longitude': self.lon, 'width': 256,
                               'height': 240, 'frame_rate': 1337, 'camera_name': 'Test camera name'})

    def test_non_existing_clip(self):
        """
        Test with non existing clip.
        """
        self.assertRaises(FileNotFoundError, get_clip_info, file_path='home/user/test_folder/test_clip.avi',
                          folder_id=1337, name='test_clip', video_format='avi')


class ParseMetadataTest(TestCase):

    @patch('builtins.open', new_callable=mock_open, read_data=METADATA_EXAMPLE)
    def test_with_example_data(self, mock_file):
        """
        Test parsing an example metadata file.
        """
        lat, lon, st, cm_name = parse_metadata(file_path='home/user/test_folder/test_clip.avi')
        self.assertEqual(lat, Decimal('59.388668'))
        self.assertEqual(lon, Decimal('17.926501'))
        self.assertEqual(st, timezone.datetime(year=2018, month=9, day=6, hour=15, minute=45, second=59,
                                               tzinfo=pytz.timezone(settings.TIME_ZONE)))
        self.assertEqual(cm_name, 'Test camera name')
        mock_file.assert_called_once_with(file='home/user/test_folder/test_clip.avi.txt', errors='ignore', mode='r')

    def test_non_existing_file(self):
        """
        Test parsing a non existing file. Should give FileNotFoundError.
        """
        self.assertRaises(FileNotFoundError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data=METADATA_EXAMPLE + "\nBAD DATA (1337, 42)")
    def test_extra_parenthesis_in_metadata(self, mock_file):
        """
        Test parsing metadata with extra parentheses. Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data="2018-09-06 15:45:59.603    (2018-09-06 15:45:59)"
                                                              "59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)"
                                                              "\n(Test camera name)")
    def test_wrong_order_of_metadata(self, mock_file):
        """
        Test parsing metadata with location and time in reversed order. Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data="59°23'19.2\"N 17°55'35.4\"E   (59.38, 17.9, 42.0)\n"
                                                              "2018-09-06 15:45:59.603     (2018-09-06 15:45:59)\n"
                                                              "(Test camera name)")
    def test_extra_location_value_of_metadata(self, mock_file):
        """
        Test parsing metadata. Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data="59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)\n"
                                                              "2018-09-06 25:45:59.603     (2018-09-06 25:45:59)\n"
                                                              "(Test camera name)")
    def test_wrong_datetime_format(self, mock_file):
        """
        Test parsing metadata. Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data="59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)\n"
                                                              "2018-09-06 25:45:59.603     (2018-09-06 25:45:59)")
    def test_missing_camera_name(self, mock_file):
        """
        Test parsing metadata. Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')


def cap_get(x):
    """
    Function used to mimic the behaviour of VideoCapture.get.
    :param x: Given argument.
    """
    if x == cv2.CAP_PROP_FPS:
        return 42
    elif x == cv2.CAP_PROP_FRAME_COUNT:
        return 1337.0
    elif x == cv2.CAP_PROP_FRAME_WIDTH:
        return 256
    elif x == cv2.CAP_PROP_FRAME_HEIGHT:
        return 240


class GetClipDetailsTest(TestCase):

    @patch('backend.file_manager.os.path.isfile')
    @patch('backend.file_manager.cv2.VideoCapture')
    def test_valid_clip(self, mock_cap, mock_isfile):
        """
        Test getting details of a clip. Should round down for duration.
        """
        mock_isfile.return_value = True
        mock_cap.return_value.get.side_effect = cap_get
        self.assertEqual(get_clip_details('home/user/test_folder/test_clip.avi'), (31, 42, 256, 240))
        mock_cap.assert_called_once_with('home/user/test_folder/test_clip.avi')

    def test_non_existing_clip(self):
        """
        Test calling function with non existing clip.
        """
        self.assertRaises(FileNotFoundError, get_clip_details, file_path='home/user/test_folder/no_clip.avi')
