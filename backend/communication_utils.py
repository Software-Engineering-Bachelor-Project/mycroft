import os
from typing import Optional
from django.utils import timezone

# --- ID:s ---
from django.utils.dateparse import parse_datetime

PROJECT_ID = 'project_id'
FOLDER_ID = 'folder_id'
CAMERA_ID = 'camera_id'
CLIP_ID = 'clip_id'
FILTER_ID = 'filter_id'
PROGRESS_ID = 'progress_id'
AREA_ID = "area_id"

# --- Text ---
PROJECT_NAME = 'project_name'
CLIP_NAME = 'clip_name'

# --- OS related ---
FILE_PATH = 'file_path'

# --- Objects ---
PROJECTS = 'projects'
FOLDERS = 'folders'
CAMERAS = 'cameras'
AREAS = "areas"

# --- Lists of ID:s ---
CAMERA_IDS = 'camera_ids'
CLIP_IDS = 'clip_ids'
AREA_IDS = 'area_ids'

INCLUDED_CLIP_IDS = "included_clip_ids"

EXCLUDED_CLIP_IDS = "excluded_clip_ids"

# --- Lists of values ---
WHITELISTED_RESOLUTIONS = "whitelisted_resolutions"
LONGITUDE = "longitude"
LATITUDE = "latitude"
RADIUS = "radius"

# --- Resolution related---
HEIGHT = "height"
WIDTH = "width"

# --- Lists of text ---
ADD_CLASSES = "add_classes"
REMOVE_CLASSES = "remove_classes"
CLASSES = "classes"

# --- Quality related ---
MIN_WIDTH = "min_width"
MIN_HEIGHT = "max_width"
MIN_FRAMERATE = " min_framerate"

# --- Time related ---
START_TIME = "start_time"
END_TIME = "end_time"

# --- Progress related ---
TOTAL = 'total'
CURRENT = 'current'

# --- Object detection related ---
RATE = 'rate'


# --- Functions ---

def os_aware(data: dict) -> dict:
    """
    Makes data OS aware by changing all separators in file paths to match the current operating system.

    :param data: JSON data.
    :return: OS aware JSON data.
    """
    for key, val in data.items():
        if isinstance(val, dict):
            data[key] = os_aware(val)
        elif isinstance(val, list):
            if len(val) > 0:
                if isinstance(val[0], dict):
                    data[key] = [os_aware(x) for x in val]
                else:
                    data[key] = [replace_sep(x) for x in val]
        else:
            data[key] = replace_sep(val)
    return data


def replace_sep(val):
    """
    Changes separator if given input is str.

    :param val: Input.
    :return: Modified val.
    """
    opp_sep = '/' if os.name == 'nt' else '\\'  # Decide opposite separator depending on OS.
    if isinstance(val, str):
        val = val.replace(opp_sep, os.path.sep)
    return val


def date_str_to_datetime(date_str: Optional[str]) -> timezone.datetime:
    """
    Converts a date string to a datetime object.

    :param date_str: Date string (iso8601)
    :return: A datetime object.
    """
    if date_str is None:
        return None

    return parse_datetime(date_str)
