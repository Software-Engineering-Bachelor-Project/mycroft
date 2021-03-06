from django.urls import path
from . import views

'''
This file specifies the mapping between urls and views

Note: The "name" parameter is used in tests to decouple the urls from tests. This mean that you can change the urls and 
not affect the tests if the name parameter is unchanged
'''

app_name = 'backend'
urlpatterns = [
    path('filter/create_area', views.filter_create_area, name='filter create area'),
    path('filter/delete_area', views.filter_delete_area, name='filter delete area'),
    path('filter/get_areas', views.filter_get_areas, name='filter get areas'),
    path('filter/get_matching_clips', views.filter_get_matching_clips, name='filter get matching'),
    path('filter/modify', views.filter_modify, name='filter modify'),
    path('filter/get_params', views.filter_get_params, name='filter get params'),
    path('filter/get_filter', views.filter_get_filter, name='filter get filter'),

    path('project/get_all', views.project_get_all, name='project get all'),
    path('project/new', views.project_new, name='project new'),
    path('project/delete', views.project_delete, name='project delete'),
    path('project/rename', views.project_rename, name='project rename'),

    path('export/filter/<int:fid>/', views.export_filter, name='export filter'),
    path('export/clips/<int:fid>/', views.export_clips, name='export clips'),

    path('video/get_info', views.video_get_info, name='video info'),
    path('video/get_sequential', views.video_get_sequential, name='video sequential'),
    path('video/get_cameras', views.video_get_cameras, name='video get cameras'),

    path('file/get_source_folders', views.file_get_source_folders, name='file get source folders'),
    path('file/get_folders', views.file_get_folders, name='file get folders'),
    path('file/add_folder', views.file_add_folder, name='file add folder'),
    path('file/remove_folder', views.file_remove_folder, name='file remove folder'),
    path('file/get_clips', views.file_get_clips, name='file get clips'),
    path('file/get_files', views.file_get_files, name='file get files'),

    path('object_detection/detect_objects', views.detect_objects, name='detect objects'),
    path('object_detection/get_progress', views.get_progress, name='get progress'),
    path('object_detection/delete_progress', views.delete_progress, name='delete progress'),
    path('video/stream/<int:cid>/', views.get_clip_stream, name='video stream'),
]
