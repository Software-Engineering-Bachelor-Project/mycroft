import re, logging
import pytz
from django.conf import settings
import cv2

from .database_wrapper import *
from .communication_utils import *
from .serialization import *

# This file represents the backend File Manager.

VIDEO_FORMATS = ["mkv", "flv", "vob", "ogv", "ogg",
                 "264", "263", "mjpeg", "avc", "m2ts",
                 "mts", "avi", "mov", "qt", "wmv", "mp4",
                 "m4p", "m4v", "mpg", "mp2", "mpeg",
                 "mpe", "mpv", "m2v", "m4v", "3gp", "3g2",
                 "flv", "f4v", "f4p", "f4a", "f4b", "webm"]


def get_folders(data: dict) -> (int, dict):
    """
    Get all folders in a project.

    :param data: Project id.
    :return: Status code, all folders in project in JSON.
    """
    try:
        pid = data[PROJECT_ID]
    except KeyError:
        return 400, {}  # Bad request

    try:
        root_folders = get_folders_in_project(pid=pid)
    except AssertionError:
        return 204, {}  # No content

    folders = root_folders[::1]
    for f in root_folders:
        folders += get_subfolders_recursive(fid=f.id)

    return 200, os_aware({FOLDERS: serialize(folders)})


def add_folder(data: dict) -> (int, dict):
    """
    Adds a folder to a project.

    :param data: Project id and (absolute) file path to folder.
    :return: Status code, id of given folder.
    """
    try:
        pid = data[PROJECT_ID]
        file_path = data[FILE_PATH]
    except KeyError:
        return 400, {}  # Bad request

    try:
        path, name = split_file_path(file_path=file_path)
    except ValueError:
        return 400, {}  # Bad request

    fid = create_root_folder(path=path, name=name)

    try:
        add_folder_to_project(fid=fid, pid=pid)
    except AssertionError:
        return 204, {}  # No content

    return 200, os_aware({FOLDER_ID: fid})


def build_file_structure(file_path: str) -> None:
    """
    Traverses the user's file system from the given folder downwards while adding all folder and clips to the database.

    :param file_path: Absolute path to folder in file system.
    """
    # Divide folder path in name and path.
    path, name = split_file_path(file_path=file_path)

    # Create root and set parent id.
    parent_id = create_root_folder(path=path, name=name)

    # Traverse all subfolders and add the to the database.
    traverse_subfolders(path=file_path, parent_id=parent_id)


def traverse_subfolders(path: str, parent_id: int) -> None:
    """
    Recursive helper to build_file_structure.

    :param path: The absolute path to a folder.
    :param parent_id: The parent folder's id.
    """
    for entry in os.scandir(path):  # Iterate over all entries in the folder.
        file_path = os.path.join(path, entry.name)  # Save file path to current entry.
        if entry.is_dir():
            fid = create_subfolder(parent_fid=parent_id, name=entry.name)
            traverse_subfolders(path=file_path, parent_id=fid)  # Traverse subfolders of entry.
        elif entry.is_file():
            is_clip, name, suffix = analyze_file(entry.name)
            if is_clip:
                try:
                    create_clip(**get_clip_info(file_path=file_path, folder_id=parent_id, name=name,
                                                video_format=suffix))
                except ValueError:
                    logging.info(msg="No metadata found for: " + file_path)


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


def get_clip_info(file_path: str, folder_id: int, name: str, video_format: str) -> dict:
    """
    Finds all information related to the clip and returns a dictionary that can be used as input to the
    function create_clip in the database wrapper.

    :param file_path: The absolute path to a clip.
    :param folder_id: The clip's parent folder's id.
    :param name: The name of the clip.
    :param video_format: The video format of the clip.
    :return: A dictionary with the valid parameters for create_clip in database_wrapper.py.
    """
    latitude, longitude, start_time = parse_metadata(file_path=file_path)
    duration, frame_rate, width, height = get_clip_details(file_path=file_path)
    end_time = start_time + timezone.timedelta(seconds=duration)
    return {'fid': folder_id, 'name': name, 'video_format': video_format, 'start_time': start_time,
            'end_time': end_time, 'latitude': latitude, 'longitude': longitude, 'width': width, 'height': height,
            'frame_rate': frame_rate}


def parse_metadata(file_path: str) -> (Decimal, Decimal, timezone.datetime):
    """
    Parses a clip's metadata for location and start time.

    Metadata has the same name as the clip but with .txt as an extra suffix.

    Example of metadata:
    59°23'19.2"N 17°55'35.4"E   (59.388668, 17.926501)
    2018-09-06 15:45:59.603     (2018-09-06 15:45:59)

    :param file_path: The absolute path to a clip.
    :return: (latitude: Decimal, longitude, Decimal: datetime.datetime)
    """
    wrong_format_error = ValueError("Metadata has the wrong format.")

    # Read metadata from file.
    with open(file=file_path + '.txt', mode='r') as f:
        content = f.read()

    # Find both parentheses from metadata.
    parentheses = re.findall('\(.*?\)', content)
    if len(parentheses) != 2:
        raise wrong_format_error

    # Extract latitude and longitude from location parentheses.
    location = re.split(string=parentheses[0][1:-1], pattern=', ')
    if len(location) != 2:
        raise wrong_format_error
    try:
        lat = Decimal(location[0])
        lon = Decimal(location[1])
    except SyntaxError:
        raise wrong_format_error

    # Extract start time from time parentheses.
    try:
        start_time = timezone.datetime.strptime(parentheses[1][1:-1], '%Y-%m-%d %H:%M:%S')
        start_time = start_time.replace(tzinfo=pytz.timezone(settings.TIME_ZONE))  # make timezone aware
    except ValueError:
        raise wrong_format_error

    return lat, lon, start_time


def get_clip_details(file_path: str) -> (int, float, int, int):
    """
    Gets a clip's duration, frame rate and dimensions (width, height).

    :param file_path: The absolute path to a clip.
    :return: Duration in seconds, frame rate in FPS and width and height in pixels.
             This is given in the form of a tuple (duration, frame rate, width, height).
    """
    # Check if clip exists
    if not os.path.isfile(path=file_path):
        raise FileNotFoundError

    cap = cv2.VideoCapture(file_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    return int(frames/fps), fps, width, height


def split_file_path(file_path: str) -> (str, str):
    """
    Splits a file path for path and name.

    E.g. home/user/folder -> (home/user/, folder)

    :param file_path: A file path.
    :return: The path and the name in the given file path as a tuple.
    """
    split = file_path.rsplit(sep=os.path.sep, maxsplit=1)
    if len(split) != 2:
        raise ValueError("Given file path is not valid.")
    path = os.path.join(split[0], '')  # Add delimiter to path
    name = split[-1]

    return path, name
