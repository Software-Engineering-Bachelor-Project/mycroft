import mimetypes
import re
from wsgiref.util import FileWrapper

from django.core.handlers.wsgi import WSGIRequest
from django.http import FileResponse

from .database_wrapper import *
from .communication_utils import *
from .serialization import *


# This file represents the backend Video Manager.


def get_clip_info(data: dict) -> (int, dict):
    """
    Gets a clip based on id.
    May be deleted i the future because is not used.

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

    res = remove_clip_not_in_project_from_camera({CAMERAS: serialize(cameras)}, pid=pid)

    return 200, os_aware(res)


def remove_clip_not_in_project_from_camera(data: dict, pid: int) -> dict:
    """
    Removes clips in camera that is not in project.

    :param data: dict with cameras.
    :param pid: project id.
    :return: dict with cameras with updated clip_set.
    """
    for cm in data[CAMERAS]:
        cid_not_in_project = []

        for cid in cm['clip_set']:
            clip = get_clip_by_id(cid=cid)
            if clip not in get_all_clips_in_project(pid=pid):
                cid_not_in_project.append(cid)

        for cid in cid_not_in_project:
            cm['clip_set'].remove(cid)

    return data


def get_video_stream(request: WSGIRequest, cid: int) -> FileResponse:
    """
    Returns a response to a request for a video

    Solution based on this: https://stackoverflow.com/questions/33208849/python-django-streaming-video-mp4-file-using-httpresponse
    Stream the given clip
    :param request:
    :param cid: the clip id
    :return: a response to a request for a part of a video
    """
    clip = get_clip_by_id(cid)
    assert clip is not None
    path = str(clip)

    # Get range parameters from request header
    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = range_re.match(range_header)

    # Get information about file to be sent
    size = os.path.getsize(path)
    content_type, encoding = mimetypes.guess_type(path)
    content_type = content_type or 'application/octet-stream'

    # Part of the file should be sent
    if range_match:
        # Get what parts of the file that should be sent
        first_byte, last_byte = range_match.groups()
        first_byte = int(first_byte) if first_byte else 0
        last_byte = int(last_byte) if last_byte else size - 1
        if last_byte >= size:
            last_byte = size - 1
        length = last_byte - first_byte + 1

        # Create response and set headers
        resp = FileResponse(RangeFileWrapper(open(path, 'rb'), offset=first_byte, length=length), status=206,
                            content_type=content_type)
        resp['Content-Length'] = str(length)
        resp['Content-Range'] = 'bytes %s-%s/%s' % (first_byte, last_byte, size)

    # The entire file should be sent
    else:
        resp = FileResponse(FileWrapper(open(path, 'rb')), content_type=content_type)
        resp['Content-Length'] = str(size)

    resp['Accept-Ranges'] = 'bytes'
    return resp


class RangeFileWrapper(object):
    """
    Wrapper for a file that is sent in a request
    """

    def __init__(self, file, blksize=8192, offset=0, length=None):
        self.file = file
        self.file.seek(offset, os.SEEK_SET)
        self.remaining = length
        self.blksize = blksize

    def close(self):
        if hasattr(self.file, 'close'):
            self.file.close()

    def __iter__(self):
        return self

    def __next__(self):
        if self.remaining is None:
            # If remaining is None, we're reading the entire file.
            data = self.file.read(self.blksize)
            if data:
                return data
            raise StopIteration()
        else:
            if self.remaining <= 0:
                raise StopIteration()
            data = self.file.read(min(self.remaining, self.blksize))
            if not data:
                raise StopIteration()
            self.remaining -= len(data)
            return data


# Pattern for parameters in range header
range_re = re.compile(r'bytes\s*=\s*(\d+)\s*-\s*(\d*)', re.I)
