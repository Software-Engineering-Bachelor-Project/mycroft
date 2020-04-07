from django.urls import path
from . import views
'''
This file specifies the mapping between urls and views

Note: The "name" parameter is used in tests to decouple the urls from tests. This mean that you can change the urls and 
not affect the tests if the name parameter is unchanged
'''

app_name = 'backend'
urlpatterns = [
    path('filter', views.filter, name='filter'),

    path('project/get_all', views.project_get_all, name='project get all'),
    path('project/save', views.project_save, name='project save'),
    path('project/open', views.project_open, name='project open'),

    path('export/filter', views.export_filter, name='export filter'),
    path('export/clips', views.export_clips, name='export clips'),

    path('video/get_info', views.video_get_info, name='video info'),
    path('video/get_stream', views.video_get_stream, name='video stream'),

    path('file/get_folders', views.file_get_folders, name='file get folders'),
    path('file/add_folder', views.file_add_folder, name='file add folder'),

    path('object_detection/detect_objects', views.detect_objects, name='detect objects'),
]
