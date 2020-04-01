from django.core import serializers
from collections.abc import Iterable
from typing import Union, Collection

from .models import *

BACKEND_MODEL = Union[Collection[Union[Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip]],
                      Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip]


def serialize(data: BACKEND_MODEL) -> str:
    """
    Takes an object or a collection of objects and serializes it.

    :param data: An object or a collection of objects (same type) to be serializable.
    :return: The given object(s) in JSON format.
    """
    if isinstance(data, Iterable):
        return serializers.serialize(format='json', queryset=data)
    else:
        return serializers.serialize(format='json', queryset=[data])[1:-1]


def deserialize(data: str, save: bool = False) -> BACKEND_MODEL:
    """
    Deserialize objects from JSON to Django models.

    :param data: JSON object to be deserialized.
    :param save: Create or update object in database.
    :return: An object or a list of objects.
    """
    collection = True
    res = []

    # Convert to JSON array if not already done.
    if data[0] != '[' and data[-1] != ']':
        data = '[' + data + ']'
        collection = False

    for obj in serializers.deserialize("json", data):
        if save:
            obj.save()
        if collection:
            res.append(obj.object)
        else:
            return obj.object
    return res
