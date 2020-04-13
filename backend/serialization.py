from collections.abc import Collection
from collections import OrderedDict
from typing import Type, Union, List

from .model_serializers import *

BACKEND_MODEL = Union[
    List[Union[Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip, Resolution, Progress]],
    Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip, Resolution, Progress]


def serialize(data: BACKEND_MODEL) -> Union[OrderedDict, List[OrderedDict]]:
    """
    Takes an object or a collection of objects and serializes it.

    :param data: An object or a collection of objects (same type) to be serializable.
    :return: The given object(s) serialized to JSON in a dictionary.
    """
    if isinstance(data, Collection):
        if len(data) == 0:
            return []
        t = type(next(iter(data)))  # Get type of first element in given collection.
        serializer = get_serializer(t=t)(data, many=True)  # Serialize data using the corresponding ModelSerializer.
        try:
            return serializer.data  # Serialize to JSON.
        except AttributeError:
            raise AttributeError('The function serialize was given a collection of objects of different types.')
    else:
        serializer = get_serializer(t=type(data))
        return serializer(data).data


def get_serializer(t: Type) -> serializers.ModelSerializer():
    """
    Takes a type of model and returns its corresponding serializer.

    :param t: Type of model to get serializer for.
    :return: A ModelSerializer for the given type.
    """
    if t in MODEL_TO_SERIALIZER:
        return MODEL_TO_SERIALIZER[t]
    else:
        raise TypeError('The function get_serializer was given an unknown type.')
