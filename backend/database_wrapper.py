from typing import List, Optional, Tuple
import datetime
from decimal import Decimal
from django.db.models import Q

from .models import Project, Folder, Filter, Camera, ObjectDetection, Object, ObjectClass, Clip

"""
This is the wrapper to the database.
It's through the functions in this file all interaction with the database is performed.

Philosophy:
    - Model objects are never passed as parameters, just their id's.
    - QuerySets are never returned, just Python lists. 
"""


# --- Project ---

def create_project(name: str) -> int:
    """
    Creates a new project and saves to the database.

    :param name: Name of project to be created.
    :return: The created project's id (primary key).
    """
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
    Project.objects.get(id=pid).delete()


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
    Gets all folders in the project.

    :param pid: The projects id.
    :return: A list of all the project's folders.
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    return p.folders.all()[::1]


def get_all_filters_from_project(pid: int) -> List[Filter]:
    """
    Gets all filters in the project.
    :param pid: The projects id.
    :return: A list of all the project's filters.
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    return p.filter_set.all()[::1]


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
    Folder.objects.get(id=fid).delete()


# --- Clip ---

def create_clip(fid: int, name: str, video_format: str, start_time: datetime.datetime, end_time: datetime.datetime,
                latitude: Decimal, longitude: Decimal) -> int:
    """
    Creates a clip if not already in database.
    Fetches id if clip already in database.
    Creates a camera for the clip if not already in database.

    :param fid: The id of the folder which the clip is located in.
    :param name: The name of the clip.
    :param video_format: The format of the clip (max 5 characters).
    :param start_time: The start time for the clip.
    :param end_time: The end time for the clip.
    :param latitude: Latitude for the position of the camera.
    :param longitude: Longitude for the position of the camera.
    :return: The created clip's id.
    """
    f = get_folder_by_id(fid=fid)
    assert f is not None
    camera = Camera.objects.get_or_create(latitude=latitude, longitude=longitude)[0]
    clip = Clip.objects.get_or_create(folder=f, name=name, video_format=video_format, start_time=start_time,
                                      end_time=end_time, camera=camera)[0]
    return clip.id


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
    Clip.objects.get(id=cid).delete()


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
    Camera.objects.get(id=cmid).delete()


def get_objects_in_camera(cmid: int, start_time: datetime.datetime = None, end_time: datetime.datetime = None,
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
    ods = cm.objectdetection_set.filter(Q(start_time__gte=start_time, end_time__lte=end_time) |
                                        Q(start_time__lte=start_time, end_time__gte=start_time) |
                                        Q(start_time__lte=end_time, end_time__gte=end_time))
    res = []
    for od in ods:
        res += get_objects_in_detection(odid=od.id, start_time=start_time, end_time=end_time,
                                        object_classes=object_classes)
    return res


# --- Filter ---

def create_filter(pid: int, name: str) -> int:
    """
    Creates a new filter with the given name and adds it to the project.

    :param pid: The project's id.
    :param name: The name of the filter.
    :return: The id of the filter.
    """
    p = get_project_by_id(pid=pid)
    assert p is not None
    f = Filter.objects.create(name=name, project=p)
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
    Filter.objects.get(id=fid).delete()


def add_camera_to_filter(fid: int, cmid: int) -> None:
    """
    Adds a camera to a filter.

    :param fid: The filter's id.
    :param cmid: The camera's id.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    cm = get_camera_by_id(cmid=cmid)
    assert cm is not None
    f.cameras.add(cm)


def remove_camera_from_filter(fid: int, cmid: int) -> None:
    """
    Removes a camera from a filter.

    :param fid: The filter's id.
    :param cmid: The camera's id.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    cm = get_camera_by_id(cmid=cmid)
    assert cm is not None
    f.cameras.remove(cm)


def get_all_cameras_in_filter(fid: int) -> List[Camera]:
    """
    Gets all filtered cameras.
    
    :param fid: The id of the filter.
    :return: A list of cameras.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    return f.cameras.all()[::1]


def modify_filter(fid: int, name: str = None, latitude: Decimal = None, longitude: Decimal = None, radius: int = None,
                  start_time: datetime.datetime = None, end_time: datetime.datetime = None,
                  add_classes: List[str] = None, remove_classes: List[str] = None) -> None:
    """
    Changes the given values in the specified filter.
    
    NOTE:
        Not all parameters have to be given. The function only modifies the the specified parameters.

    :param fid: The filter's id.
    :param name: New name for filter.
    :param latitude: New latitude for filter.
    :param longitude: New longitude for filter.
    :param radius: New radius for filter.
    :param start_time: New start time for filter.
    :param end_time: New end time for filter.
    :param add_classes: Object classes to be added to filter.
    :param remove_classes: Object classes to be removed from filter.
    """
    f = get_filter_by_id(fid=fid)
    assert f is not None
    if name is not None:
        f.name = name
    if latitude is not None:
        f.latitude = latitude
    if longitude is not None:
        f.longitude = longitude
    if radius is not None:
        f.radius = radius
    if start_time is not None:
        f.start_time = start_time
    if end_time is not None:
        f.end_time = end_time
    if add_classes is not None:
        for oc in add_classes:
            obj_cls = ObjectClass.objects.get_or_create(object_class=oc)[0]
            f.classes.add(obj_cls)
    if remove_classes is not None:
        for oc in remove_classes:
            obj_cls = ObjectClass.objects.get_or_create(object_class=oc)[0]
            f.classes.remove(obj_cls)
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

def create_object_detection(cmid: int, sample_rate: float, start_time: datetime.datetime, end_time: datetime.datetime,
                            objects=None) -> int:
    """
    Creates an object detection.

    :param cmid: The id of the camera.
    :param sample_rate: The sample rate of the object detection.
    :param start_time: Start time of object detection.
    :param end_time: End time of object detection.
    :param objects: List of tuples with classes and time of objects found in detection.
    :return: The id of the created object detection.
    """
    if objects is None:
        objects = []
    cm = get_camera_by_id(cmid=cmid)
    assert cm is not None
    od = ObjectDetection.objects.get_or_create(camera=cm, sample_rate=sample_rate, start_time=start_time,
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
    ObjectDetection.objects.get(id=odid).delete()


def add_objects_to_detection(odid: int, objects: List[Tuple[str, datetime.datetime]]) -> None:
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


def get_objects_in_detection(odid: int, start_time: datetime.datetime = None, end_time: datetime.datetime = None,
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