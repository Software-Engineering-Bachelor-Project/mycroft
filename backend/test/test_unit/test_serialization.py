from decimal import Decimal
from django.test import TestCase
from backend.serialization import *
from django.utils import timezone
import pytz


class SerializeTest(TestCase):

    def setUp(self) -> None:
        """
        Create objects to be used.
        """
        self.rf = Folder.objects.create(path="/home/user/", name="test_folder")
        self.sf = Folder.objects.create(parent=self.rf, name="test_subfolder", path="/home/user/test_folder/")
        self.cm = Camera.objects.create(start_time=timezone.datetime(2020, 5, 17, tzinfo=pytz.UTC),
                                        end_time=timezone.datetime(2020, 5, 18, tzinfo=pytz.UTC),
                                        latitude=Decimal('0.0'), longitude=Decimal('0.0'))
        self.cl = Clip.objects.create(name='test_clip', folder=self.rf, video_format='tvf', camera=self.cm,
                                      start_time=timezone.datetime(2020, 5, 17, tzinfo=pytz.UTC),
                                      end_time=timezone.datetime(2020, 5, 18, tzinfo=pytz.UTC))
        self.folders = [self.rf, self.sf]
        self.objects = [self.sf, self.cm, self.cl]

    def test_serialize_object(self):
        """
        Test serializing various objects.
        """
        self.assertEqual(serialize(data=self.rf),
                         '{"model": "backend.folder", "pk": 1, "fields": {"parent": null, "path": '
                         '"/home/user/", "name": "test_folder"}}')
        self.assertEqual(serialize(data=self.sf),
                         '{"model": "backend.folder", "pk": 2, "fields": {"parent": 1, "path": '
                         '"/home/user/test_folder/", "name": "test_subfolder"}}')
        self.assertEqual(serialize(data=self.cm),
                         '{"model": "backend.camera", "pk": 1, "fields": {"latitude": "0.0", "longitude":'
                         ' "0.0", "start_time": "2020-05-17T00:00:00Z", "end_time": "2020-05-18T00:00:00Z"}}')
        self.assertEqual(serialize(data=self.cl),
                         '{"model": "backend.clip", "pk": 1, "fields": {"folder": 1, "name": "test_clip",'
                         ' "video_format": "tvf", "camera": 1, "start_time": "2020-05-17T00:00:00Z", '
                         '"end_time": "2020-05-18T00:00:00Z"}}')

    def test_serialize_collection(self):
        """
        Test serializing various collections of objects.
        """
        self.assertEqual(serialize(data=self.folders),
                         '[{"model": "backend.folder", "pk": 1, "fields": {"parent": null, "path": '
                         '"/home/user/", "name": "test_folder"}}, {"model": "backend.folder", "pk": 2, '
                         '"fields": {"parent": 1, "path": "/home/user/test_folder/", "name": '
                         '"test_subfolder"}}]')
        self.assertEqual(serialize(data=self.objects),
                         '[{"model": "backend.folder", "pk": 2, "fields": {"parent": 1, "path": '
                         '"/home/user/test_folder/", "name": "test_subfolder"}}, {"model": "backend.camera", '
                         '"pk": 1, "fields": {"latitude": "0.0", "longitude": "0.0", "start_time": '
                         '"2020-05-17T00:00:00Z", "end_time": "2020-05-18T00:00:00Z"}}, {"model": '
                         '"backend.clip", "pk": 1, "fields": {"folder": 1, "name": "test_clip", '
                         '"video_format": "tvf", "camera": 1, "start_time": "2020-05-17T00:00:00Z", '
                         '"end_time": "2020-05-18T00:00:00Z"}}]')

    def test_deserialize_to_object(self):
        """
        Test deserializing various objects.
        """
        self.assertEqual(self.rf, deserialize(
            data='{"model": "backend.folder", "pk": 1, "fields": {"parent": null, "path": "/home/user/", '
                 '"name": "test_folder"}}'))
        self.assertEqual(self.sf, deserialize(
            data='{"model": "backend.folder", "pk": 2, "fields": {"parent": 1, "path": '
                 '"/home/user/test_folder/", "name": "test_subfolder"}}'))
        self.assertEqual(self.cm, deserialize(
            data='{"model": "backend.camera", "pk": 1, "fields": {"latitude": "0.0", "longitude":'
                 ' "0.0", "start_time": "2020-05-17T00:00:00Z", "end_time": "2020-05-18T00:00:00Z"}}'))
        self.assertEqual(self.cl, deserialize(
            data='{"model": "backend.clip", "pk": 1, "fields": {"folder": 1, "name": "test_clip",'
                 ' "video_format": "tvf", "camera": 1, "start_time": "2020-05-17T00:00:00Z", '
                 '"end_time": "2020-05-18T00:00:00Z"}}'))

    def test_deserialize_to_collection(self):
        """
        Test deserializing various collections of objects.
        """
        self.assertEqual(self.folders, deserialize(
            data='[{"model": "backend.folder", "pk": 1, "fields": {"parent": null, "path": '
                 '"/home/user/", "name": "test_folder"}}, {"model": "backend.folder", "pk": 2, '
                 '"fields": {"parent": 1, "path": "/home/user/test_folder/", "name": '
                 '"test_subfolder"}}]'))
        self.assertEqual(self.objects, deserialize(
            data='[{"model": "backend.folder", "pk": 2, "fields": {"parent": 1, "path": '
                 '"/home/user/test_folder/", "name": "test_subfolder"}}, {"model": "backend.camera", '
                 '"pk": 1, "fields": {"latitude": "0.0", "longitude": "0.0", "start_time": '
                 '"2020-05-17T00:00:00Z", "end_time": "2020-05-18T00:00:00Z"}}, {"model": '
                 '"backend.clip", "pk": 1, "fields": {"folder": 1, "name": "test_clip", '
                 '"video_format": "tvf", "camera": 1, "start_time": "2020-05-17T00:00:00Z", '
                 '"end_time": "2020-05-18T00:00:00Z"}}]'))

    def test_deserialize_and_save(self):
        """
        Test deserializing to update/create objects.
        """
        # Update the name of a clip.
        deserialize(data='{"model": "backend.clip", "pk": 1, "fields": {"folder": 1, "name": "new_name",'
                         ' "video_format": "tvf", "camera": 1, "start_time": "2020-05-17T00:00:00Z", '
                         '"end_time": "2020-05-18T00:00:00Z"}}', save=True)
        self.assertEqual(Clip.objects.get(id=1).name, "new_name")

        # Create a new camera.
        deserialize(data='{"model": "backend.camera", "pk": null, "fields": {"latitude": "0.1", "longitude": "1.0", '
                         '"start_time": "2020-05-17T00:00:00Z", "end_time": "2020-05-18T00:00:00Z"}}', save=True)
        self.assertEqual(Camera.objects.count(), 2)

        # Create two new subfolders.
        deserialize(data='[{"model": "backend.folder", "pk": null, "fields": {"parent": 1, "path": '
                         '"/home/user/test_folder/", "name": "folder1"}}, {"model": "backend.folder", "pk": null, '
                         '"fields": {"parent": 1, "path": "/home/user/test_folder/", "name": "folder2"}}]', save=True)
        self.assertEqual(Folder.objects.filter(parent=self.rf).count(), 3)

        # Modify the created subfolders to be subfolders of test_subfolder
        deserialize(data='[{"model": "backend.folder", "pk": 3, "fields": {"parent": 2, "path": '
                         '"/home/user/test_folder/test_subfolder/", "name": "folder1"}}, {"model": "backend.folder", '
                         '"pk": 4, "fields": {"parent": 2, "path": "/home/user/test_folder/test_subfolder", "name": '
                         '"folder2"}}]', save=True)
        self.assertEqual(Folder.objects.filter(parent=self.sf).count(), 2)
