from decimal import Decimal
from django.test import TestCase
from backend.serialization import *
from django.utils import timezone
from django.conf import settings
import pytz


class SerializeTest(TestCase):

    def setUp(self) -> None:
        """
        Create objects to be used.
        """
        self.rf = Folder.objects.create(path="/home/user/", name="test_folder")
        self.sf = Folder.objects.create(parent=self.rf, name="test_subfolder", path="/home/user/test_folder/")
        self.cm = Camera.objects.create(start_time=timezone.datetime(2020, 5, 17,
                                                                     tzinfo=pytz.timezone(settings.TIME_ZONE)),
                                        end_time=timezone.datetime(2020, 5, 18,
                                                                   tzinfo=pytz.timezone(settings.TIME_ZONE)),
                                        latitude=Decimal('0.0'), longitude=Decimal('0.0'))
        self.resolution = Resolution.objects.create(height=10, width=10)

        self.cl = Clip.objects.create(folder=self.rf, name='test_clip', video_format='tvf',
                                      start_time=timezone.datetime(2020, 5, 17,
                                                                   tzinfo=pytz.timezone(settings.TIME_ZONE)),
                                      end_time=timezone.datetime(2020, 5, 18,
                                                                 tzinfo=pytz.timezone(settings.TIME_ZONE)),
                                      camera=self.cm, resolution=self.resolution,
                                      frame_rate=42)
        self.folders = [self.rf, self.sf]
        self.objects = [self.sf, self.cm, self.cl]

    def test_serialize_object(self):
        """
        Test serializing various objects.
        """
        self.assertEqual(serialize(data=self.rf),
                         {'id': 1, 'path': '/home/user/', 'name': 'test_folder', 'parent': None, 'clip_set': [self.cl.id]})
        self.assertEqual(serialize(data=self.sf),
                         {'id': 2, 'path': '/home/user/test_folder/', 'name': 'test_subfolder', 'parent': 1, 'clip_set': []})
        self.assertEqual(serialize(data=self.cm), {'id': 1, 'latitude': '0.00000000', 'longitude': '0.00000000',
                                                   'start_time': '2020-05-17T00:00:00+01:00',
                                                   'end_time': '2020-05-18T00:00:00+01:00', 'clip_set': [self.cl.id]})
        self.assertEqual(serialize(data=self.cl), {'id': 1, 'name': 'test_clip', 'video_format': 'tvf',
                                                   'start_time': '2020-05-17T00:00:00+01:00',
                                                   'end_time': '2020-05-18T00:00:00+01:00', 'resolution': 1,
                                                   'frame_rate': 42.0, 'folder': 1, 'camera': 1, 'duplicates': [],
                                                   'overlap': []})

    def test_serialize_collection(self):
        """
        Test serializing a collection of objects (folders).
        """
        self.assertEqual(serialize(data=self.folders),
                         [OrderedDict(
                             [('id', 1), ('clip_set', [self.cl.id]), ('path', '/home/user/'), ('name', 'test_folder'),
                              ('parent', None)]),
                          OrderedDict([('id', 2), ('clip_set', []), ('path', '/home/user/test_folder/'),
                                       ('name', 'test_subfolder'), ('parent', 1)])])

    def test_serialize_empty_collection(self):
        """
        Test serializing an empty collection.
        """
        self.assertEqual(serialize(data=[]), [])

    def test_serialize_collection_different_types(self):
        """
        Test serializing a collection of objects of different types.
        """
        self.assertRaises(AttributeError, serialize, data=self.objects)


class GetSerializerTest(TestCase):

    def setUp(self) -> None:
        """
        Add dict with all models and their serializers.
        """
        self.model_to_serializers = {Folder: FolderSerializer,
                                     Project: ProjectSerializer,
                                     Camera: CameraSerializer,
                                     ObjectClass: ObjectClassSerializer,
                                     Filter: FilterSerializer,
                                     ObjectDetection: ObjectDetectionSerializer,
                                     Object: ObjectSerializer,
                                     Clip: ClipSerializer,
                                     Resolution: ResolutionSerializer,
                                     Progress: ProgressSerializer,
                                     }

    def test_all_types(self):
        """
        Test that get_serializer works as expected for all types.
        """
        for model in self.model_to_serializers:
            self.assertEqual(get_serializer(t=model), self.model_to_serializers[model])

    def test_bad_type(self):
        """
        Test that calling get_serializer with invalid type results in a TypeError.
        """
        self.assertRaises(TypeError, get_serializer, object)

    def test_model_to_serializers_dict(self):
        """
        Test that the generated model to serializer dict equals the manually written.
        """
        self.assertEqual(self.model_to_serializers, MODEL_TO_SERIALIZER)
