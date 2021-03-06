import inspect
import sys

from rest_framework import serializers

from .models import Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip, Resolution, Progress, \
    Area


class FolderSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    clip_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Folder
        exclude = ['is_entry']


class ResolutionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Resolution
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    filter_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'


class CameraSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    clip_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Camera
        fields = '__all__'


class ObjectClassSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = ObjectClass
        fields = '__all__'


class FilterSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Filter
        exclude = ['project', 'areas']


class ObjectDetectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = ObjectDetection
        fields = '__all__'


class ObjectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Object
        fields = '__all__'


class ClipSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    objectdetection_set = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Clip
        exclude = ['hash_sum']


class ProgressSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Progress
        fields = '__all__'


class AreaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    class Meta:
        model = Area
        fields = '__all__'


# Create a dict with all models and their corresponding model serializers.
MODEL_TO_SERIALIZER = {cls.Meta.model: cls for name, cls in inspect.getmembers(sys.modules[__name__], inspect.isclass)
                       if issubclass(cls, serializers.ModelSerializer)}
