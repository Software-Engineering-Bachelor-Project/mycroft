# This file represents the backend Filter Module.
from typing import List

import backend.database_wrapper as dbw
from backend.communication_utils import *
from backend.models import Clip
from .serialization import *
from django.utils.timezone import utc


def modify_filter(data: dict) -> (int, dict):
    """
    Modifies a given filter based on the given parameters,  if a parameter has
         the value null the corresponding value in the filter is set to it´s default.

    :param data: A dictionary that need to have the keys:
        filter_id, start_time, end_time, add_classes, remove_classes, min_width, min_height, min_frame_rate
    :return: Status code, empty dict.
    """
    # retrieving necessary parameters.
    try:
        params = {"fid": data[FILTER_ID]}
    except KeyError:
        return 400, {}  # Missing parameter(s)

    # Retrieve voluntary parameters, they will be None if the parameter don´t, exist. and their standard value if they
    # have the value None
    if START_TIME in data:
        params["start_time"] = date_str_to_datetime(data[START_TIME]) if data[
                                                                             START_TIME] is not None else timezone.datetime.min.replace(
            tzinfo=utc)

    if END_TIME in data:
        params["end_time"] = date_str_to_datetime(data[END_TIME]) if data[
                                                                         END_TIME] is not None else timezone.datetime.max.replace(
            tzinfo=utc)

    if CLASSES in data:
        params["classes"] = data[CLASSES] if data[CLASSES] is not None else []

    if WHITELISTED_RESOLUTIONS in data:
        params["whitelisted_resolutions"] = data[WHITELISTED_RESOLUTIONS] if data[
                                                                                 WHITELISTED_RESOLUTIONS] is not None else []

    if MIN_FRAMERATE in data:
        params["min_frame_rate"] = data[MIN_FRAMERATE] if data[MIN_FRAMERATE] is not None else 0

    if EXCLUDED_CLIP_IDS in data:
        params["excluded_clips"] = data[EXCLUDED_CLIP_IDS] if data[EXCLUDED_CLIP_IDS] is not None else []

    if INCLUDED_CLIP_IDS in data:
        params["included_clips"] = data[INCLUDED_CLIP_IDS] if data[INCLUDED_CLIP_IDS] is not None else []

    # Modify the given filter
    try:
        dbw.modify_filter(**params)
    except AssertionError:
        return 204, {}

    return 200, {}


def get_clips_matching_filter(data: dict) -> (int, dict):
    """
    Returns all clips and their corresponding cameras given a list of camera ids and a filter id.

    :param data: A dictionary that need to have the key "filter_id".
    :return: Status code, clip id:s and camera id:s in JSON.
    """
    # Retrieve parameters and verify that they exist
    try:
        filter_id = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request, missing parameters

    # Retrieve clips
    try:
        matching_clips = dbw.get_all_clips_matching_filter(filter_id)
    except AssertionError:
        return 204, {}  # No content

    # Create lists of ids
    res_camera_ids = {clip.camera.id for clip in matching_clips}
    res_clip_ids = {clip.id for clip in matching_clips}

    # Constructing the response
    res = {
        CLIP_IDS: list(res_clip_ids),
        CAMERA_IDS: list(res_camera_ids)
    }
    return 200, os_aware(res)


def get_areas_in_filter(data: dict) -> (int, dict):
    """
    Returns all areas in a filter

    :param data: A dictionary that need to have the key "filter_id".
    :return: Status code and area objects
    """
    # Retrieve parameters and verify that they exist
    try:
        filter_id = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request, missing parameters

    try:
        areas = dbw.get_areas_in_filter(filter_id)
    except AssertionError:
        return 204, {}  # No content

    # Construct the response
    res = {
        AREAS: serialize(areas)
    }

    return 200, os_aware(res)


def create_area(data: dict) -> (int, dict):
    """
    Creates an area

    :param data: A dictionary that need to have the keys longitude, latitude, radius and filter id
    :return: Status code and area id
    """
    # Retrieve parameters and verify that they exist
    try:
        lon = data[LONGITUDE]
        lat = data[LATITUDE]
        rad = data[RADIUS]
        fid = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request, missing parameters

    # Construct the response
    res = {
        AREA_ID: dbw.create_area(latitude=lat, longitude=lon, radius=rad, fid=fid)
    }

    return 200, os_aware(res)


def delete_area(data: dict) -> (int, dict):
    """
    Deletes a given area from a given filter.

    :param data: A dictionary that need to have the keys area_id and filter_id.
    :return: Status code, empty dict.
    """
    # Retrieve parameters and verify that they exist
    try:
        aid = data[AREA_ID]
        fid = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request, missing parameters

    dbw.delete_area(aid=aid, fid=fid)

    return 200, {}


def get_params(data: dict) -> (int, dict):
    """
    Returns the params in a filter

    :param data: A dictionary that need to have the key filter id
    :return: Status code and a dict of resolutions that exist in the project and available classes
    """
    # Retrieve parameters and verify that they exist
    try:
        fid = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request, missing parameters

    f: Filter = dbw.get_filter_by_id(fid)
    if f is None:
        return 204, {}  # Bad fid

    # Construct the response
    res = {
        CLASSES: ["car", "person", "bicycle"],
        RESOLUTIONS: serialize(dbw.get_all_resolutions_in_project(f.project.id))
    }

    return 200, os_aware(res)


def get_filter(data: dict) -> (int, dict):
    """
    Gets a filter.

    :param data: Filter id.
    :return: Status code, the serialized filter.
    """
    try:
        fid = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request


    found_filter = dbw.get_filter_by_id(fid)
    if not found_filter:
        return 204, {}  # No content

    # Prepare found filter for serialization. NOTE: Not saving on purpose.
    if found_filter.start_time == timezone.datetime.min.replace(tzinfo=utc):
        found_filter.start_time = None
    if found_filter.end_time == timezone.datetime.max.replace(tzinfo=utc):
        found_filter.end_time = None

    return 200, os_aware({FILTER: serialize(found_filter)})
