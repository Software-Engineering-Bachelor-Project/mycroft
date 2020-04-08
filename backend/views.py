from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Module imports
import backend.filter_module as filter_module
import backend.project_manager as project_manager
import backend.exporter as exporter
import backend.video_manager as video_manager
import backend.file_manager as file_manager
import backend.object_detector as object_detector

# each view follow the naming convention:  module name_action

@api_view(['POST'])
def filter(request):
    """
    Delegates a 'filter' request to the Filter Module.
    :return: A response from the Filter Module.
    """
    data = filter_module.filter_clips(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def project_get_all(request):
    """
    Delegates a 'get all' request to the Project Manager.
    :return: A response from the Project Manager.
    """
    data = project_manager.get_projects(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def project_new(request):
    """
    Delegates a 'new' request to the Project Manager.
    :return: A response from the Project Manager.
    """
    data = project_manager.new_project(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def project_delete(request):
    """
    Delegates a 'delete' request to the Project Manager.
    :return: A response from the Project Manager.
    """
    data = project_manager.delete_project(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def project_rename(request):
    """
    Delegates a 'rename' request to the Project Manager.
    :return: A response from the Project Manager.
    """
    data = project_manager.rename_project(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def export_filter(request):
    """
    Delegates a 'filter' request to the Exporter.
    :return: A response from the Exporter.
    """
    data = exporter.export_filter(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def export_clips(request):
    """
    Delegates a 'clips' request to the Exporter.
    :return: A response from the Exporter.
    """
    data = exporter.export_clips(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def video_get_info(request):
    """
    Delegates a 'clip info' request to the Video Manager.
    :return: A response from the Video Manager.
    """
    data = video_manager.get_clip_info(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def video_get_stream(request):
    """
    Delegates a 'clip stream' request to the Video Manager.
    :return: A response from the Video Manager.
    """
    data = video_manager.get_clip_stream(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def file_get_folders(request):
    """
    Delegates a 'get folders' request to the File Manager.
    :return: A response from the File Manager.
    """
    data = file_manager.get_folders(request.data)
    return Response(data[1], data[0])

@api_view(['POST'])
def file_add_folder(request):
    """
    Delegates a 'add folder' request to the File Manager.
    :return: A response from the File Manager.
    """
    data = file_manager.add_folder(request.data)
    return Response(data[1], data[0])


@api_view(['POST'])
def detect_objects(request):
    """
    Delegates a 'detect objects' request to the Object Detector.
    :return: A response from the Object Detector.
    """
    data = object_detector.detect_objects(request.data)
    return Response(data[1], data[0])

