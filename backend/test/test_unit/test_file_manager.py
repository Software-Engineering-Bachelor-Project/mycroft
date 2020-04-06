from unittest.mock import patch, mock_open

from django.test import TestCase

# Import module
from backend.file_manager import *

METADATA_EXAMPLE = "59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)\n2018-09-06 15:45:59.603     " \
                                "(2018-09-06 15:45:59)"


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

    def test_no_path(self):
        """
        Test giving function a clip without path. Should give ValueError.
        """
        self.assertRaises(ValueError, build_file_structure, file_path='test_clip.avi')


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
        mock_parse_metadata.return_value = (self.lat, self.lon, self.st)
        mock_get_clip_details.return_value = (42, 256, 240)
        res = get_clip_info(file_path='home/user/test_folder/test_clip.avi', folder_id=1337, name='test_clip',
                            video_format='avi')
        self.assertEqual(res, {'fid': 1337, 'name': 'test_clip', 'video_format': 'avi', 'start_time': self.st,
                               'end_time': self.et, 'latitude': self.lat, 'longitude': self.lon, 'width': 256,
                               'height': 240})

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
        lat, lon, st = parse_metadata(file_path='home/user/test_folder/test_clip.avi')
        self.assertEqual(lat, Decimal('59.388668'))
        self.assertEqual(lon, Decimal('17.926501'))
        self.assertEqual(st, timezone.datetime(year=2018, month=9, day=6, hour=15, minute=45, second=59,
                                               tzinfo=pytz.timezone(settings.TIME_ZONE)))
        mock_file.assert_called_once_with(file='home/user/test_folder/test_clip.avi.txt', mode='r')

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
                                                              "59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)\n")
    def test_wrong_order_of_metadata(self, mock_file):
        """
        Test parsing metadata with location and time in reversed order. Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data="59°23'19.2\"N 17°55'35.4\"E   (59.38, 17.9, 42.0)\n"
                                                              "2018-09-06 15:45:59.603     (2018-09-06 15:45:59)")
    def test_extra_location_value_of_metadata(self, mock_file):
        """
        Test parsing metadata . Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')

    @patch('builtins.open', new_callable=mock_open, read_data="59°23'19.2\"N 17°55'35.4\"E   (59.388668, 17.926501)\n"
                                                              "2018-09-06 25:45:59.603     (2018-09-06 25:45:59)")
    def test_wrong_datetime_format(self, mock_file):
        """
        Test parsing metadata . Should give ValueError.
        """
        self.assertRaises(ValueError, parse_metadata, file_path='home/user/test_folder/test_clip.avi')


class GetClipDetails(TestCase):

    @patch('backend.file_manager.VideoFileClip')
    def test_valid_clip(self, mock):
        """
        Test getting details of a clip. Should round down for duration.
        """
        type(mock.return_value).duration = 3.14
        type(mock.return_value).w = 256
        type(mock.return_value).h = 240
        self.assertEqual(get_clip_details('home/user/test_folder/test_clip.avi'), (3, 256, 240))

    def test_non_existing_clip(self):
        """
        Test calling function with non existing clip.
        """
        self.assertRaises(FileNotFoundError, get_clip_details, file_path='home/user/test_folder/no_clip.avi')
