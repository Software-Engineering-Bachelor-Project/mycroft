from django.http import HttpResponse, JsonResponse
from zipfile import ZipFile
import io

from .database_wrapper import *
from .communication_utils import *


# This file represents the backend Exporter.

def export_filter(fid: int) -> HttpResponse:
    """
    Exports a filter to JSON.

    :param fid: Filter id.
    :return: Exported filter in JSON.
    """
    f = get_filter_by_id(fid=fid)
    if f is None:
        response = HttpResponse()
        response.status_code = 204
        return response

    clip_list = [{'file_path': replace_sep(clip.folder.path + clip.folder.name + "/" + clip.name + "." +
                                           clip.video_format), 'start_time': str(clip.start_time)} for clip in
                 get_all_clips_matching_filter(fid=fid)]

    area_list = [area for area in f.areas.all()]
    areas = []
    for area in area_list:
        areas.append({"latitude": area.latitude,
                      "longitude": area.longitude, "radius": area.radius})
    objects = [str(obj) for obj in f.classes.all()[::1]]

    res = {'filter': {'start_time': str(f.start_time), 'end_time': str(f.end_time), 'objects': objects},
           'areas': areas, 'clips': clip_list}

    response = JsonResponse(os_aware(res))
    response['Content-Disposition'] = 'attachment; filename="{0}_filter.json"'.format(
        f.project.name)
    return response


def export_clips(fid: int) -> HttpResponse:
    """
    Compresses all filtered clips and exports them.

    :param fid: Filter id.
    :return: Compressed clips.
    """
    f = get_filter_by_id(fid=fid)
    if f is None:
        response = HttpResponse()
        response.status_code = 204
        return response

    # Create zip archive
    buffer = io.BytesIO()
    res = ZipFile(buffer, 'w')

    clips = get_all_clips_matching_filter(fid=fid)
    for clip in clips:
        res.write(str(clip), arcname=get_project_path(clip=clip))  # clip
        res.write(str(clip) + ".txt", arcname=get_project_path(clip=clip) + ".txt")  # metadata

    res.close()

    # Create response
    response = HttpResponse(buffer.getvalue())
    response['Content-Type'] = 'application/x-zip-compressed'
    response['Content-Disposition'] = 'attachment; filename={0}_clips.zip'.format(f.project.name)
    return response
