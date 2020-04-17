from .database_wrapper import *
from .communication_utils import *


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
    # TODO: Implement
    return 200, {}
