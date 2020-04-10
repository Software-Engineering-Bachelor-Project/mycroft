from unittest.mock import patch
from django.test import TestCase

# Import module
from backend.communication_utils import *


class OSAware(TestCase):

    def setUp(self) -> None:
        self.data_linux = {'id': 42, 'file_path': '/home/user/test', 'folder': {'path': '/home/user/test_folder'}, 'clips': ['/home/user/test_folder/test_clip1.tvf', '/home/user/test_folder/test_clip2.tvf'], 'folders':[{'file_path': '/home/user/test/1'}, {'file_path': '/home/user/test/2'}]}
        self.data_windows = {'id': 42, 'file_path': '\\home\\user\\test', 'folder': {'path': '\\home\\user\\test_folder'}, 'clips': ['\\home\\user\\test_folder\\test_clip1.tvf', '\\home\\user\\test_folder\\test_clip2.tvf'], 'folders':[{'file_path': '\\home\\user\\test\\1'}, {'file_path': '\\home\\user\\test\\2'}]}

    @patch('backend.communication_utils.os')
    def test_linux(self, mock_os):
        mock_os.name = 'posix'
        mock_os.path.sep = '/'
        self.assertEqual(os_aware(self.data_linux), self.data_linux)
        self.assertEqual(os_aware(self.data_windows), self.data_linux)

    @patch('backend.communication_utils.os')
    def test_windows(self, mock_os):
        mock_os.name = 'nt'
        mock_os.path.sep = '\\'
        self.assertEqual(os_aware(self.data_linux), self.data_windows)
        self.assertEqual(os_aware(self.data_windows), self.data_windows)