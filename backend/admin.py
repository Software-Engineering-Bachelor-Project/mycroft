from django.contrib import admin

from .models import Project, Filter, Camera, ObjectDetection, Object, Folder, Clip


class FilterInline(admin.TabularInline):
    model = Filter
    extra = 0


class FilterCameraInline(admin.TabularInline):
    model = Filter.cameras.through
    extra = 0


class ObjectDetectionInline(admin.TabularInline):
    model = ObjectDetection
    extra = 0


class ObjectInline(admin.TabularInline):
    model = Object
    extra = 0


class FolderInline(admin.TabularInline):
    model = Folder
    extra = 0


class ClipInline(admin.TabularInline):
    model = Clip
    extra = 0


class ProjectAdmin(admin.ModelAdmin):
    inlines = [FilterInline]
    list_display = ('name', 'created', 'last_updated')
    list_filter = ['last_updated', 'created']


class FilterAdmin(admin.ModelAdmin):
    inlines = [FilterCameraInline]
    fieldsets = [
        ('Interval', {'fields': ['start_time', 'end_time'], 'classes': ['collapse']}),
        ('Position', {'fields': ['latitude', 'longitude'], 'classes': ['collapse']}),
    ]
    list_display = ['name', 'project']
    list_filter = ['start_time']


class CameraAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Interval', {'fields': ['start_time', 'end_time'], 'classes': ['collapse']}),
        ('Position', {'fields': ['latitude', 'longitude'], 'classes': ['collapse']}),
    ]
    inlines = [FilterCameraInline, ObjectDetectionInline, ClipInline]
    list_display = ['start_time', 'end_time', 'latitude', 'longitude']
    list_filter = ['start_time']


class ObjectDetectionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['camera']}),
        (None, {'fields': ['sample_rate']}),
        ('Interval', {'fields': ['start_time', 'end_time'], 'classes': ['collapse']})
    ]
    inlines = [ObjectInline]
    list_display = ['sample_rate', 'start_time', 'end_time']
    list_filter = ['sample_rate', 'start_time']


class FolderAdmin(admin.ModelAdmin):
    inlines = [FolderInline, ClipInline]


admin.site.register(Project, ProjectAdmin)
admin.site.register(Filter, FilterAdmin)
admin.site.register(Camera, CameraAdmin)
admin.site.register(ObjectDetection, ObjectDetectionAdmin)
admin.site.register(Folder, FolderAdmin)
