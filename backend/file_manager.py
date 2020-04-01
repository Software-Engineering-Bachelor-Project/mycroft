import os
from django.utils import timezone

from .database_wrapper import *

# This file represents the backend File Manager.

VIDEO_FORMATS = ["mkv", "flv", "vob", "ogv", "ogg",
                 "264", "263", "mjpeg", "avc", "m2ts",
                 "mts", "avi", "mov", "qt", "wmv", "mp4",
                 "m4p", "m4v", "mpg", "mp2", "mpeg",
                 "mpe", "mpv", "m2v", "m4v", "3gp", "3g2",
                 "flv", "f4v", "f4p", "f4a", "f4b", "webm"]


def get_folders(data: dict) -> (int, dict):
    # TODO: Implement
    return 200, {}


def add_folders(data: dict) -> (int, dict):
    # TODO: Implement
    return 200, {}


def build_file_structure(file_path: str) -> None:
    """
    Traverses the user's file system from the given folder and downwards while adding all folder and clips to the
    database.

    :param file_path: Absolute path to folder in file system.
    """
    # Divide folder path in name and path.
    split = file_path.rsplit(sep=os.path.sep, maxsplit=1)
    path = os.path.join(split[0], '')  # Add delimiter to path
    name = split[-1]

    # Create root and set parent id.
    parent_id = create_root_folder(path=path, name=name)

    traverse_subfolders(path=file_path, parent_id=parent_id)


def traverse_subfolders(path: str, parent_id: int) -> None:
    """
    Recursive helper to build_file_structure.

    :param path: The absolute path to a folder.
    :param parent_id: The parent folder's id.
    """
    for entry in os.scandir(path):
        if entry.is_dir():
            fid = create_subfolder(parent_fid=parent_id, name=entry.name)
            traverse_subfolders(path=os.path.join(path, entry.name), parent_id=fid)
        elif entry.is_file():
            is_clip, name, suffix = analyze_file(entry.name)
            if is_clip:
                create_clip(**get_clip_info(folder_id=parent_id, name=name, video_format=suffix))


def analyze_file(file: str) -> (bool, str, str):
    """
    Analyzes a file.
    Decides if it is a clip.
    Finds name and suffix.

    :param file: File (str) on the form filename.suffix.
    :return: Tuple with three elements: (is clip, name of file, format of file).
    """
    split = file.rsplit(sep='.', maxsplit=1)
    if len(split) != 2:
        raise ValueError("Given file is not valid")
    name = split[0]
    suffix = split[1]
    is_clip = suffix in VIDEO_FORMATS
    return is_clip, name, suffix


def get_clip_info(folder_id: int, name: str, video_format: str) -> dict:
    """
    Finds all information related to the clip and returns a dictionary that can be used as input to the
    function create_clip in the database wrapper.

    :param folder_id: The clip's parent folder's id.
    :param name: The name of the clip.
    :param video_format: The video format of the clip.
    :return:
    """
    # TODO: Implement
    return {'fid': folder_id, 'name': name, 'video_format': video_format, 'start_time': timezone.now(),
            'end_time': timezone.now(), 'latitude': Decimal(), 'longitude': Decimal()}
