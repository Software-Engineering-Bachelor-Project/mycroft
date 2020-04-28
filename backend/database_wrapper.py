from typing import List, Optional, Tuple, Dict
from django.utils import timezone
from decimal import Decimal
from django.db.models import Q
import hashlib
import cv2

from .communication_utils import replace_sep
from .models import Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip, Resolution, Progress, \
    Area

"""
This is the wrapper to the database.
It's through the functions in this file all interaction with the database is performed.

Philosophy:
    - Model objects are never passed as parameters, just their id's.
    - QuerySets are never returned, just Python lists. 
"""

# Todo: Test different formats to determine which are playable
PLAYABLE_FORMATS = ["mp4"]


# --- Project ---

def create_project(name: str) -> int:
    """
    Creates a new project and saves to the database.

    :param name: Name of project to be created.
    :return: The created project's id (primary key).
    """

    if Project.objects.filter(name=name):
        raise ValueError
    p = Project.objects.create(name=name)

    return p.id


def get_project_by_id(pid: int) -> Optional[Project]:
    """
    Gets the project with the specified id.

    :param pid: The project's id (primary key).
    :return: A project with the specified id or None.
    """
    try:
        return Project.objects.get(id=pid)
    except Project.DoesNotExist:
        return None


def get_project_by_name(name: str) -> Project:
    """
    Gets one project with the given name.

    :param name: Name of the project to be fetched.
    :return: A project with the specified name or None.
    """
    return Project.objects.filter(name=name).first()


def get_all_projects() -> List[Project]:
    """
    Gets all projects.

    :return: A list of all projects.
    """
    return Project.objects.all()[::1]


def delete_project(pid: int) -> None:
    """
    Deletes the project with the specified id.

    :param pid: The project's id (primary key).
    """
    try:
        Project.objects.get(id=pid).delete()
    except Project.DoesNotExist:
        pass


def rename_project(new_name: str, pid: int) -> None:
    """
    Renames a project.

    :param new_name: New name of project.
    :param pid: The project's id (primary key).
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    p.name = new_name
    p.save()


def add_folder_to_project(fid: int, pid: int) -> None:
    """
    Adds a folder to a project.
    Does nothing if folder or a parent to the folder already is in project.
    Removes subfolders to given folder.

    :param fid: The folder's id.
    :param pid: The project's id.
    """
    nf = get_folder_by_id(fid=fid)
    assert nf is not None
    p = get_project_by_id(pid=pid)
    assert p is not None

    for f in p.folders.all():
        if nf == f or nf in get_subfolders_recursive(fid=f.id):
            return

    nf_subfolders = get_subfolders_recursive(fid=fid)
    for f in p.folders.all():
        if f in nf_subfolders:
            delete_folder_from_project(pid=pid, fid=f.id)

    p.folders.add(nf)


def delete_folder_from_project(fid: int, pid: int) -> None:
    """
    Deletes the given folder from the given project.

    :param fid: The folder's id.
    :param pid: The project's id.
    """
    f = get_folder_by_id(fid=fid)
    assert f is not None
    p = get_project_by_id(pid=pid)
    assert p is not None
    p.folders.remove(f)


def get_folders_in_project(pid: int) -> List[Folder]:
    """
    Gets all root folders in the project.

    :param pid: The projects id.
    :return: A list of the projects root folder.
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    return p.folders.all()[::1]


# --- Folder ---

def create_root_folder(path: str, name: str) -> int:
    """
    Creates a root folder if folder not in database.
    Fetches id if folder already in database.
    Handles paths with both slash and backslash as separator.

    :param path: The path to the folder in the users file system.
    :param name: The name of the folder.
    :return: The id of the folder.
    """
    path = path.replace('\\', '/')
    f = Folder.objects.get_or_create(path=path, name=name)[0]
    set_to_entry(fid=f.id)
    return f.id


def create_subfolder(parent_fid: int, name: str) -> int:
    """
    Creates a folder given its parent folder.
    Fetches id if folder already in database.

    :param parent_fid: Parent folder's id.
    :param name: The name of the folder.
    :return: The id of the folder.
    """
    p = get_folder_by_id(fid=parent_fid)
    assert p is not None
    path = p.path + p.name + '/'
    f = Folder.objects.get_or_create(path=path, name=name)[0]
    f.parent = p
    f.save()
    return f.id


def get_folder_by_id(fid: int) -> Optional[Folder]:
    """
    Gets a folder using id.

    :param fid: The folder's id (primary key).
    :return: A folder with the specified id or None.
    """
    try:
        return Folder.objects.get(id=fid)
    except Folder.DoesNotExist:
        return None


def get_folder_by_path(path: str, name: str) -> Optional[Folder]:
    """
    Gets a folder using path.

    :param path: The path to the folder in the users file system.
    :param name: The name of the folder.
    :return: A folder with the specified name and path or None.
    """
    try:
        path = path.replace('\\', '/')
        return Folder.objects.get(path=path, name=name)
    except Folder.DoesNotExist:
        return None


def get_folder_by_parent(parent_fid: int, name: str) -> Optional[Folder]:
    """
    Gets a folder using its parent.

    :param parent_fid: The id  of folder's parent.
    :param name: The name of the folder.
    :return: A folder with the specified parent or None.
    """
    p = get_folder_by_id(fid=parent_fid)
    if p is None:
        return None
    else:
        try:
            return Folder.objects.get(parent=p, name=name)
        except Folder.DoesNotExist:
            return None


def get_all_folders() -> List[Folder]:
    """
    Gets all folders.

    :return: A list of all folders.
    """
    return Folder.objects.all()[::1]


def get_subfolders(fid: int) -> List[Folder]:
    """
    Gets all folders in inside given folder.

    :param fid: The id of the folder.
    :return: A list of folders.
    """
    f = get_folder_by_id(fid=fid)
    assert f is not None
    return f.folder_set.all()[::1]


def get_subfolders_recursive(fid: int) -> List[Folder]:
    """
    Gets all folders inside given folder including subfolders.

    :param fid: The id of the folder.
    :return: A list of folders.
    """
    res = []
    q = [fid]
    while q:
        sfs = get_subfolders(fid=q.pop(0))
        res += sfs
        q += [f.id for f in sfs]
    return res


def delete_folder(fid: int) -> None:
    """
    Deletes the specified folder.

    :param fid: The folder's id.
    """
    try:
        Folder.objects.get(id=fid).delete()
    except Folder.DoesNotExist:
        pass


def set_to_entry(fid: int) -> None:
    """
    Changes the is_entry field to True.

    :param fid: The folder's id.
    """
    f = get_folder_by_id(fid=fid)
    assert f is not None
    f.is_entry = True
    f.save()


def get_subfolders_to_entries() -> List[Folder]:
    """
    Gets all folders who's parent is an entry folder.

    :return: A list of folders.
    """
    return Folder.objects.filter(parent__is_entry=True).all()[::1]


# --- Clip ---

def create_clip(fid: int, clip_name: str, video_format: str, start_time: timezone.datetime,
                end_time: timezone.datetime, latitude: Decimal, longitude: Decimal,
                width: int, height: int, frame_rate: float, camera_name: str) -> int:
    """
    Creates a clip if not already in database.
    Fetches id if clip already in database.
    Creates a camera for the clip if not already in database.

    :param fid: The id of the folder which the clip is located in.
    :param clip_name: The name of the clip.
    :param video_format: The format of the clip (max 5 characters).
    :param start_time: The start time for the clip.
    :param end_time: The end time for the clip.
    :param latitude: Latitude for the position of the camera.
    :param longitude: Longitude for the position of the camera.
    :param width: Width of clip in pixels.
    :param height: Height of clip in pixels.
    :param frame_rate: The frame rate of the clip in FPS.
    :param camera_name: The name of the camera the clip belongs to.
    :return: The created clip's id.
    """
    f = get_folder_by_id(fid=fid)
    assert f is not None

    camera = Camera.objects.get_or_create(name=camera_name, longitude=longitude, latitude=latitude)[0]
    resolution = Resolution.objects.get_or_create(width=width, height=height)[0]
    clip = Clip.objects.get_or_create(folder=f, name=clip_name, video_format=video_format, start_time=start_time,
                                      end_time=end_time, camera=camera, resolution=resolution,
                                      frame_rate=frame_rate)[0]

    if video_format in PLAYABLE_FORMATS:
        clip.playable = True

    hash_sum = create_hash_sum(f, clip)
    assert hash_sum is not None
    clip.hash_sum = hash_sum
    clip.save()

    find_duplicate_overlapping_clips(cmid=camera.id, cid=clip.id)

    return clip.id


def find_duplicate_overlapping_clips(cmid: int, cid: int) -> None:
    """
    Check for duplicates and overlapping clips.

    :param cmid: Camera id.
    :param cid: Clip id.
    :return: None.
    """
    camera = get_camera_by_id(cmid=cmid)
    clip = get_clip_by_id(cid=cid)

    for c in camera.clip_set.all():
        if clip != c:
            if clip.hash_sum == c.hash_sum:
                clip.duplicates.add(c)
            elif clip.start_time <= c.start_time < clip.end_time or \
                    clip.start_time < c.end_time <= clip.end_time or \
                    clip.start_time > c.start_time and clip.end_time < c.end_time:
                clip.overlap.add(c)


def create_hash_sum(folder: Folder, clip: Clip) -> Optional[str] or Optional[None]:
    file = replace_sep(folder.path + folder.name + "\\" + clip.name + "." + clip.video_format)
    file_hash = hashlib.sha256()

    cap = cv2.VideoCapture(file)
    success, frame = cap.read()

    if success:
        file_hash.update(frame)
        cap.release()
        return file_hash.hexdigest()
    else:
        return None


def get_clip_by_id(cid: int) -> Optional[Clip]:
    """
    Gets a clip by id.

    :param cid: The clip's id.
    :return: The specified clip or None.
    """
    try:
        return Clip.objects.get(id=cid)
    except Clip.DoesNotExist:
        return None


def get_clip_by_name(fid: int, name: str, video_format: str) -> Optional[Clip]:
    """
    Gets a folder by its name and folder.

    :param fid: The folder's id.
    :param name: The name of the clip.
    :param video_format: The format of the clip.
    :return: The specified clip or None.
    """
    f = get_folder_by_id(fid=fid)
    if f is None:
        return None
    else:
        try:
            return Clip.objects.get(folder=f, name=name, video_format=video_format)
        except Clip.DoesNotExist:
            return None


def delete_clip(cid: int) -> None:
    """
    Deletes the specified clip.

    :param cid: The clip's id.
    """
    try:
        Clip.objects.get(id=cid).delete()
    except Clip.DoesNotExist:
        pass


def get_all_clips_from_folder(fid: int) -> List[Clip]:
    """
    Gets all clips in the given folder.

    :param fid: The id of the folder.
    :return: A list of all clips.
    """
    f = get_folder_by_id(fid=fid)
    assert f is not None
    return f.clip_set.all()[::1]


def get_all_clips_from_folder_recursive(fid: int) -> List[Clip]:
    """
    Gets all clips in the given folder and subfolders.

    :param fid: The id of the folder.
    :return: A list of all clips.
    """
    res = get_all_clips_from_folder(fid=fid)
    for folder in get_subfolders_recursive(fid=fid):
        res += get_all_clips_from_folder(fid=folder.id)
    return res


def get_all_clips_matching_filter(fid: int) -> List[Clip]:
    """
    gets all te clips that is part of the project and matches the filter
    :param fid: The filter the clips should match
    :return: A list of all clips that is part of the project and matches the filter
    """

    filter = get_filter_by_id(fid)
    assert filter is not None

    clips = get_all_clips_in_project(filter.project.id)
    res = []

    for clip in clips:
        if filter.clip_match_filter(clip):
            res.append(clip)
    return res


def get_all_clips_in_project(pid: int) -> List[Clip]:
    """
    :param pid: the id of the project
    :return: A list of all clips that is part of the project
    """
    folders = get_folders_in_project(pid)
    clips = []

    for folder in folders:
        clips.extend(get_all_clips_from_folder_recursive(folder.id))
    return clips


# --- Camera ---

def get_camera_by_id(cmid: int) -> Optional[Camera]:
    """
    Gets a camera by id.

    :param cmid: The camera's id.
    :return: A camera or None.
    """
    try:
        return Camera.objects.get(id=cmid)
    except Camera.DoesNotExist:
        return None


def get_camera_by_location(latitude: Decimal, longitude: Decimal) -> Optional[Camera]:
    """
    Gets a camera by position.

    :param latitude: Latitude for the position of the camera.
    :param longitude: Longitude for the position of the camera.
    :return: A camera or None.
    """
    try:
        return Camera.objects.get(latitude=latitude, longitude=longitude)
    except Camera.DoesNotExist:
        return None


def delete_camera(cmid: int) -> None:
    """
    Deletes the specified camera.

    :param cmid: The camera's id.
    """
    try:
        Camera.objects.get(id=cmid).delete()
    except Camera.DoesNotExist:
        pass


def get_objects_in_camera(cmid: int, start_time: timezone.datetime = None, end_time: timezone.datetime = None,
                          object_classes: List[str] = None) -> List[Object]:
    """
    Returns all objects from the camera meeting the specified requirements.

    :param cmid: The camera's id.
    :param start_time: A minimum time for objects.
    :param end_time: A maximum time for objects.
    :param object_classes: A list of the interesting object classes.
    :return: A list of objects.
    """
    cm = get_camera_by_id(cmid=cmid)
    assert cm is not None
    if start_time is None:
        start_time = cm.start_time
    if end_time is None:
        end_time = cm.end_time

    ods = []
    for c in cm.clip_set.all():
        ods += c.objectdetection_set.filter(Q(start_time__gte=start_time, end_time__lte=end_time) |
                                            Q(start_time__lte=start_time, end_time__gte=start_time) |
                                            Q(start_time__lte=end_time, end_time__gte=end_time))
    res = []
    for od in ods:
        res += get_objects_in_detection(odid=od.id, start_time=start_time, end_time=end_time,
                                        object_classes=object_classes)
    return res


def get_all_cameras_in_project(pid: int) -> List[Camera]:
    """
    Gets all cameras in a project.

    :param pid: The id of the project
    :return: A list of all cameras in the project.
    """
    res = set()
    for clip in get_all_clips_in_project(pid=pid):
        res.add(clip.camera)
    return list(res)


# --- Filter ---

def create_filter(pid: int) -> int:
    """
    Creates a new filter and adds it to the project.

    :param pid: The project's id.
    :return: The id of the filter.
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    f = Filter.objects.create(project=p)
    return f.id


def get_filter_by_id(fid: int) -> Optional[Filter]:
    """
    Gets the specified filter.
    
    :param fid: The id of the filter.
    :return: A filter or None. 
    """
    try:
        return Filter.objects.get(id=fid)
    except Filter.DoesNotExist:
        return None


def delete_filter(fid: int) -> None:
    """
    Deletes the specified filter.
    
    :param fid: The id of the filter.
    """
    try:
        Filter.objects.get(id=fid).delete()
    except Filter.DoesNotExist:
        pass


def get_all_filters_from_project(pid: int) -> List[Filter]:
    """
    Gets all filters in the project.
    :param pid: The projects id.
    :return: A list of all the project's filters.
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    return p.filter_set.all()[::1]


def add_included_clip_to_filter(fid: int, cid: int) -> None:
    """
    Adds a included clip to a filter.

    :param fid: The filter's id.
    :param cid: The clip's id.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    clip = get_clip_by_id(cid)
    assert clip is not None
    f.included_clips.add(clip)


def add_excluded_clip_to_filter(fid: int, cid: int) -> None:
    """
    Adds a excluded clip to a filter.

    :param fid: The filter's id.
    :param cid: The clip's id.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    clip = get_clip_by_id(cid)
    assert clip is not None
    f.excluded_clips.add(clip)


def modify_filter(fid: int, start_time: timezone.datetime = None, end_time: timezone.datetime = None,
                  classes: List[str] = None,
                  whitelisted_resolutions: List[Dict[str, int]] = None,
                  excluded_clips: List[int] = None,
                  included_clips: List[int] = None,
                  min_frame_rate: int = None) -> None:
    """
    Changes the given values in the specified filter.

    NOTE:
        Not all parameters have to be given. The function only modifies the the specified parameters

    :param included_clips: The clips that should always be included from the filter
    :param excluded_clips: The clips that always should be excluded from the filter
    :param whitelisted_resolutions: id of Resolutions that should be included in the filter
    :param classes: The classes the filter should filter for
    :param fid: The filter's id.
    :param start_time: New start time for filter.
    :param end_time: New end time for filter.
    :param min_frame_rate: Minimum frames per second.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None

    if start_time is not None:
        f.start_time = start_time

    if end_time is not None:
        f.end_time = end_time

    if classes is not None:
        f.classes.clear()
        for oc in classes:
            obj_cls = ObjectClass.objects.get_or_create(object_class=oc)[0]
            f.classes.add(obj_cls)

    if whitelisted_resolutions is not None:
        f.whitelisted_resolutions.clear()
        for res_values in whitelisted_resolutions:
            res = get_resolution_by_values(res_values["height"], res_values["width"])
            assert res is not None
            f.whitelisted_resolutions.add(res)

    if excluded_clips is not None:
        f.excluded_clips.clear()
        for clip in excluded_clips:
            add_excluded_clip_to_filter(fid, clip)

    if included_clips is not None:
        f.included_clips.clear()
        for clip in included_clips:
            add_included_clip_to_filter(fid, clip)

    if min_frame_rate is not None:
        f.min_frame_rate = min_frame_rate

    f.project.last_updated = timezone.datetime.now()
    f.project.save()
    f.save()


def get_all_classes_in_filter(fid: int) -> List[ObjectClass]:
    """
    Returns a list of all object classes in the filter.

    :param fid: The filter's id.
    :return: A list of object classes.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    return f.classes.all()[::1]


# --- Object Detection ---

def create_object_detection(cid: int, sample_rate: float, start_time: timezone.datetime, end_time: timezone.datetime,
                            objects: List[Tuple[str, timezone.datetime]] = None) -> int:
    """
    Creates an object detection.

    :param cid: The id of the clip.
    :param sample_rate: The sample rate of the object detection.
    :param start_time: Start time of object detection.
    :param end_time: End time of object detection.
    :param objects: List of tuples with classes and time of objects found in detection.
    :return: The id of the created object detection.
    """
    if objects is None:
        objects = []
    c = get_clip_by_id(cid=cid)
    assert c is not None
    od = ObjectDetection.objects.get_or_create(clip=c, sample_rate=sample_rate, start_time=start_time,
                                               end_time=end_time)[0]
    add_objects_to_detection(odid=od.id, objects=objects)
    return od.id


def get_object_detection_by_id(odid: int) -> Optional[ObjectDetection]:
    """
    Gets an object detection by id.

    :param odid: The object detection's id.
    :return: An object detection or None.
    """
    try:
        return ObjectDetection.objects.get(id=odid)
    except ObjectDetection.DoesNotExist:
        return None


def delete_object_detection(odid: int) -> None:
    """
    Deletes the specified object detection.

    :param odid: The object detection's id.
    """
    try:
        ObjectDetection.objects.get(id=odid).delete()
    except ObjectDetection.DoesNotExist:
        pass


def add_objects_to_detection(odid: int, objects: List[Tuple[str, timezone.datetime]]) -> None:
    """
    Adds found objects to an object detection.

    :param odid: The object detection's id.
    :param objects: List of tuples with classes and time of objects found in detection.
    :return:
    """
    od = get_object_detection_by_id(odid=odid)
    assert od is not None
    for obj_cls, time in objects:
        object_class = ObjectClass.objects.get_or_create(object_class=obj_cls)[0]
        Object.objects.create(object_detection=od, object_class=object_class, time=time)


def get_objects_in_detection(odid: int, start_time: timezone.datetime = None,
                             end_time: timezone.datetime = None,
                             object_classes: List[str] = None) -> List[Object]:
    """
    Returns all objects from object detection meeting the specified requirements.

    :param odid: The object detection's id.
    :param start_time: A minimum time for objects.
    :param end_time: A maximum time for objects.
    :param object_classes: A list of the interesting object classes.
    :return: A list of objects.
    """
    od = get_object_detection_by_id(odid=odid)
    assert od is not None
    if start_time is None:
        start_time = od.start_time
    if end_time is None:
        end_time = od.end_time
    if object_classes is None:
        return od.object_set.filter(time__gte=start_time, time__lte=end_time)[::1]
    else:
        return od.object_set.filter(time__gte=start_time, time__lte=end_time,
                                    object_class__object_class__in=object_classes)[::1]


# --- Progress ---

def create_progress(total: int, current: int = 0) -> int:
    """
    Creates a progress object.

    :param total: Total.
    :param current: Current.
    :return: The progress' id.
    """
    p = Progress.objects.create(total=total, current=current)
    return p.id


def get_progress_by_id(pid: int) -> Optional[Progress]:
    """
    Gets a progress by id.

    :param pid: The id of the progress.
    :return: The specified progress.
    """
    try:
        return Progress.objects.get(id=pid)
    except Progress.DoesNotExist:
        return None


def update_progress(pid: int, increment: int = 1) -> None:
    """
    Updates a progress object.

    :param pid: The id of the progress.
    :param increment: The value to add to current.
    """
    p = get_progress_by_id(pid=pid)
    assert p is not None
    p.current += increment
    p.save()


def delete_progress(pid: int) -> None:
    """
    Deletes the specified progress.

    :param pid: The id of the progress.
    """
    try:
        Progress.objects.get(id=pid).delete()
    except Progress.DoesNotExist:
        pass


# --- Resolution ---

def get_all_resolutions_in_project(pid: int) -> List[Resolution]:
    """
    :param pid: The projects id
    :return: A list of all resolutions that exist in the project
    """
    clips = get_all_clips_in_project(pid)
    res = set()
    for clip in clips:
        res.add(clip.resolution)
    return list(res)


def get_resolution_by_values(height: int, width: int) -> Optional[Resolution]:
    """
    :param height:
    :param width:
    :return: The corresponding Resolution
    """
    try:
        return Resolution.objects.filter(height=height, width=width).get()
    except Resolution.DoesNotExist:
        return None


# --- Areas ---

def get_areas_in_filter(fid: int) -> List[Area]:
    """
    :param fid: the filter
    :return: List of areas that is in the filter
    """
    f = get_filter_by_id(fid)
    assert f is not None

    return f.areas.all()[::1]


def create_area(latitude: Decimal, longitude: Decimal, radius: Decimal, fid: int) -> int:
    """
    Creates an area and adds to filter.

    :param latitude: longitude of area
    :param longitude: latitude of area
    :param radius: radius of area
    :param fid: id of the filter the area belongs to
    :return: the id of the created area
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None

    area = Area.objects.get_or_create(latitude=latitude, longitude=longitude, radius=radius)[0]
    f.areas.add(area)

    return area.id


def delete_area(aid: int, fid: int) -> None:
    """
    Deletes a given area from Area object and given filter.

    :param aid: area id.
    :param fid: filter id.
    :return: None.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None

    try:
        area = Area.objects.get(id=aid)
        f.areas.get(id=aid).delete()
    except Area.DoesNotExist:
        pass
