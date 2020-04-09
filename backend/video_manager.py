from .database_wrapper import *
from .communication_parameters import *
from .serialization import *

# This file represents the backend Video Manager.


def get_clip_info(data: dict) -> (int, dict):
    """
    Gets a clip based on id.

    :param data: Clip id.
    :return: Status code, clip
    """
    try:
        cid = data[CLIP_ID]
    except KeyError:
        return 400, {}  # Bad request

    clip = get_clip_by_id(cid=cid)
    if clip is None:
        return 204, {}  # No content

    return 200, serialize(clip)


def get_cameras(data: dict) -> (int, dict):
    """
    Gets all cameras in project.

    :param data: Project id.
    :return: Status code, cameras
    """
    try:
        pid = data[PROJECT_ID]
    except KeyError or AssertionError:
        return 400, {}  # Bad request

    try:
        cameras = get_all_cameras_in_project(pid=pid)
    except AssertionError:
        return 204, {}  # No content

    return 200, serialize(cameras)
