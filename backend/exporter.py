from .database_wrapper import *
from .communication_utils import *
import gzip

# This file represents the backend Exporter.


def export_filter(data: dict) -> (int, dict):
    """
    Exports a filter to JSON.

    :param data: Filter id
    :return: Status code, exported filter in JSON.
    """
    try:
        fid = data[FILTER_ID]
    except KeyError:
        return 400, {}  # Bad request

    f = get_filter_by_id(fid=fid)
    if f is None:
        return 204, {}  # No content

    res = {'start_time': str(f.start_time), 'end_time': str(f.end_time),
           'clips': [str(clip) for clip in get_all_clips_matching_filter(fid=fid)]}

    return 200, os_aware(res)


def export_clips(data: dict) -> (int, dict):
    try:
        cids = data[CLIP_IDS]
    except KeyError:
        return 400, {}  # Bad request

    c = compress_clips(clip_ids=cids)
    if c is None:
        return 204, {}  # No content

    return 200, c


def compress_clips(clip_ids: list) -> (int, list):
    """
    :param clip_ids: A list of clip ids to be compressed
    :return: A list of compressed clips
    """
    compressed_clips_list = []
    for cid in clip_ids:
        clip = get_clip_by_id(cid)
        if not clip:
            raise ValueError("Given clip id is not valid")
        file = clip.folder.path + clip.folder.name + "/" + clip.name + "." + clip.video_format
        try:
            with open(file=file, mode='rb') as f:
                compressed_clips_list.append(gzip.compress(f.read()))
        except:
            pass

    return 200, compressed_clips_list
