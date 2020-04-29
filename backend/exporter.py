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

    clip_list = [{'file_path': replace_sep(clip.folder.path + clip.folder.name + "/" + clip.name + "." +
                                           clip.video_format), 'start_time': str(clip.start_time)} for clip in
                 get_all_clips_matching_filter(fid=fid)]

    area_list = [area for area in f.areas.all()]
    areas = []
    for area in area_list:
        areas.append({"latitude": area.latitude, "longitude": area.longitude, "radius": area.radius})
    objects = [str(obj) for obj in f.classes.all()[::1]]

    res = {'filter': {'start_time': str(f.start_time), 'end_time': str(f.end_time), 'objects': objects},
           'areas': areas, 'clips': clip_list}

    return 200, os_aware(res)


def export_clips(data: dict) -> (int, dict):
    # TODO: Implement
    return 200, {}
