from django.urls import path
from . import views
'''
This file specifies the mapping between urls and views

Note: The "name" parameter is used in tests to decouple the urls from tests. This mean that you can change the urls and 
not affect the tests if the name parameter is unchanged
'''

app_name = 'backend'
urlpatterns = [
    path('filter/get_matching_clips', views.filter_get_matching_clips, name='filter get matching'),
    path('filter/modify', views.filter_modify, name='filter modify'),

    path('project/get_all', views.project_get_all, name='project get all'),
    path('project/new', views.project_new, name='project new'),
    path('project/delete', views.project_delete, name='project delete'),
    path('project/rename', views.project_rename, name='project rename'),

    path('export/filter', views.export_filter, name='export filter'),
    path('export/clips', views.export_clips, name='export clips'),

    path('video/get_info', views.video_get_info, name='video info'),
    path('video/get_cameras', views.video_get_cameras, name='video get cameras'),

    path('file/get_source_folders', views.file_get_source_folders, name='file get source folders'),
    path('file/get_folders', views.file_get_folders, name='file get folders'),
    path('file/add_folder', views.file_add_folder, name='file add folder'),

    path('object_detection/detect_objects', views.detect_objects, name='detect objects'),
    path('object_detection/get_progress', views.get_progress, name='get progress'),
    path('object_detection/delete_progress', views.delete_progress, name='delete progress'),
]
