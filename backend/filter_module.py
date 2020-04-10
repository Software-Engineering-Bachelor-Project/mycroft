# This file represents the backend Filter Module.
from typing import List

import backend.database_wrapper as dbw
from backend.communication_utils import *
from backend.models import Clip
from .serialization import *


def modify_filter(data: dict) -> (int, dict):
    """
    Modifies a given filter based on the given parameters

    :param data: A dictionary that need to have the keys:
        filter_id, start_time, end_time, add_classes, remove_classes, min_width, min_height, min_frame_rate
    :return: Status code, empty dict.
    """
    # retrieving necessary parameters.
    # TODO: Update parameters/add parsing from javascript to python datetime object.
    try:
        filter_id = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Missing parameter(s)

    # Retrieve voluntary parameters, they will be None of the parameter don´t, exist.
    start_time = data.get(START_TIME)
    end_time = data.get(END_TIME)
    add_classes = data.get(ADD_CLASSES)
    remove_classes = data.get(REMOVE_CLASSES)
    min_width = data.get(MIN_WIDTH)
    min_height = data.get(MIN_HEIGHT)
    min_frame_rate = data.get(MIN_FRAMERATE)

    # Modify the given filter
    try:
        dbw.modify_filter(fid=filter_id, start_time=start_time, end_time=end_time, add_classes=add_classes,
                          remove_classes=remove_classes, min_width=min_width, min_height=min_height,
                          min_frame_rate=min_frame_rate)
    except AssertionError:
        return 204, {}

    return 200, {}


def get_clips_matching_filter(data: dict) -> (int, dict):
    """
    Returns all clips and their corresponding cameras given a list of camera ids and a filter id.

    :param data: A dictionary that need to have the keys: "camera_ids" and "filter_id".
    :return: Status code, clip id:s and camera id:s in JSON.
    """
    # retrieving parameters and verifying that they exist
    try:
        camera_ids = data[CAMERA_IDS]
        filter_id = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request, missing parameters

    # Retrieve clips
    try:
        matching_clips = dbw.get_all_clips_matching_filter(filter_id)
        included_clips = dbw.get_all_included_clips_in_filter(filter_id)
        excluded_clips = dbw.get_all_excluded_clips_in_filter(filter_id)
    except AssertionError:
        return 204, {}  # No content

    # Filter based on cameras
    res_clips = get_clips_belonging_to_cameras(matching_clips, camera_ids)

    # Remove excluded clips
    res_clips = set(res_clips) - set(excluded_clips)

    # Add included clips
    res_clips = res_clips | set(included_clips)

    res_camera_ids = {clip.camera.id for clip in res_clips}
    res_clip_ids = {clip.id for clip in res_clips}

    # Constructing the response
    res = {
        CLIP_IDS: [str(clip_id) for clip_id in res_clip_ids],
        CAMERA_IDS: [str(cameras_id) for cameras_id in res_camera_ids]
    }
    return 200, os_aware(res)


def get_clips_belonging_to_cameras(clips: List[Clip], cameras: List[int]) -> List[Clip]:
    """
    Get all clips that belongs to one of the given cameras.

    :param: clips: Clips that should be checked if they belong to the camera.
    :param: cameras: Cameras that the clips is checked against.
    :return: List of Clips that belong to the camera.
    """
    return [c for c in clips if c.camera_id in cameras]
