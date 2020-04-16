from .database_wrapper import *
from .communication_utils import *
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

    json_clip = {**serialize(clip), 'file_path': str(clip)}

    return 200, os_aware(json_clip)


def get_sequential_clip(data: dict) -> (int, dict):
    """
    Gets the clip id to the next sequential clip if any.

    :param data: Clip id.
    :return: Status code, clip id to the next sequential clip if any.
    """
    try:
        clip_id = data[CLIP_ID]
    except KeyError:
        return 400, {}  # Bad request

    clip = get_clip_by_id(cid=clip_id)
    if clip is None:
        return 204, {}  # No content

    camera = clip.camera
    for c in camera.clip_set.all():
        if clip != c and (clip.end_time <= c.start_time <= (clip.end_time + timezone.timedelta(seconds=5))):
            cid = c.id
            return 200, {CLIP_ID: cid}

    return 200, {CLIP_ID: None}


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

    return 200, os_aware({CAMERAS: serialize(cameras)})
