from typing import List, Optional
import datetime
from decimal import Decimal

from .models import Project, Folder, Filter, Camera, ObjectDetection, Object, Clip

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


def add_folder(fid: int, pid: int) -> None:
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


# --- Folder ---

def create_root_folder(path: str, name: str) -> int:
    """
    Creates a root folder if folder not in database.
    Fetches id if folder already in database.

    :param path: The path to the folder in the users file system.
    :param name: The name of the folder.
    :return: The id of the folder.
    """
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
    f = Folder.objects.get_or_create(parent=p, name=name)[0]
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

def create_clip(fid: int, name: str, video_format: str, start_time: datetime, end_time: datetime,
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
