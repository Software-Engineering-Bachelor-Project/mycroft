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

# --- objects ---
PROJECTS = 'projects'
FOLDERS = 'folders'
CAMERAS = 'cameras'


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