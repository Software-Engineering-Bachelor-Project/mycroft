from .database_wrapper import rename_project as db_rename_project
from .database_wrapper import delete_project as db_delete_project
from .database_wrapper import *
from .serialization import *
from .communication_utils import *


# This file represents the backend Project Manager.


def get_projects(data: dict = {}) -> (int, dict):
    """
    Gets all projects from database.

    :param data: No input.
    :return: Status code, all projects in database in JSON.
    """
    return 200, os_aware({PROJECTS: serialize(get_all_projects())})


def new_project(data: dict) -> (int, dict):
    """
    Create a new project.

    :param data: Project name.
    :return: Status code, project id.
    """
    try:
        name = data[PROJECT_NAME]
    except KeyError:
        return 400, {}  # Bad request

    try:
        pid = create_project(name=name)
    except ValueError:
        return 204, {} #No project found

    create_filter(pid=pid)
    return 200, os_aware({PROJECT_ID: pid})


def delete_project(data: dict) -> (int, dict):
    """
    Deletes a project.

    :param data: Project id.
    :return: Status code, empty
    """
    try:
        pid = data[PROJECT_ID]
    except KeyError:
        return 400, {}  # Bad request

    db_delete_project(pid=pid)
    return 200, {}


def rename_project(data: dict) -> (int, dict):
    """
    Rename a project.

    :param data: Project id, project name.
    :return: Status code, empty
    """
    try:
        pid = data[PROJECT_ID]
        name = data[PROJECT_NAME]
    except KeyError:
        return 400, {}  # Bad request

    try:
        db_rename_project(pid=pid, new_name=name)
    except AssertionError:
        return 204, {}  # No content

    return 200, {}
