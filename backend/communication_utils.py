import os

# --- ID:s ---
PROJECT_ID = 'project_id'
FOLDER_ID = 'folder_id'
CAMERA_ID = 'camera_id'
CLIP_ID = 'clip_id'
FILTER_ID = 'filter_id'

# --- Text ---
PROJECT_NAME = 'project_name'
CLIP_NAME = 'clip_name'

# --- OS related ---
FILE_PATH = 'file_path'

# --- Objects ---
PROJECTS = 'projects'
FOLDERS = 'folders'
CAMERAS = 'cameras'

# --- Lists of ID:s ---
CAMERA_IDS = 'camera_ids'
CLIP_IDS = 'clip_ids'

REMOVE_INCLUDED_CLIP_IDS = "remove_included_clips "
ADD_INCLUDED_CLIP_IDS = "add_included_clips "

REMOVE_EXCLUDED_CLIP_IDS = "remove_excluded_clips"
ADD_EXCLUDED_CLIP_IDS = "add_excluded_clips"


# --- Lists of values ---
REMOVE_BLACKLISTED_RESOLUTIONS = "remove_blacklisted_resolutions"
ADD_BLACKLISTED_RESOLUTIONS = "add_blacklisted_resolutions"


# --- Lists of text ---
ADD_CLASSES = "add_classes"
REMOVE_CLASSES = "remove_classes"

# --- Quality related ---
MIN_WIDTH = "min_width"
MIN_HEIGHT = "max_width"
MIN_FRAMERATE = " min_framerate"

# --- Time related ---
START_TIME = "start_time"
END_TIME = "end_time"


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