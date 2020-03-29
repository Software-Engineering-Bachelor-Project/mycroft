from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# each view follow the naming convention:  module name_action

@api_view(['POST'])
def filter(request):
    # TODO: Implement
    return Response(
        {
        }
    )


@api_view(['POST'])
def project_get_all(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def project_save(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def project_open(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def export_filter(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def export_videos(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def video_get_info(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def video_get_stream(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def file_get_folders(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def file_add_folders(request):
    # TODO: Implement
    return Response(
        {

        }
    )


@api_view(['POST'])
def detect_objects(request):
    # TODO: Implement
    return Response(
        {

        }
    )

