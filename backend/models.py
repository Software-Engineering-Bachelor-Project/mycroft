from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError


INT_MAX_VALUE = 2147483647


class Folder(models.Model):
    """
    A folder in the user's file system.

    Path represents a location in the user's file system which doesn't include the name of the folder.
    The last character in the path is \ or / depending on OS.

    NOTE:
        Uses cascade for parent so the folder will be deleted if the parent is deleted (recursively).
        A folder needs to have a path to itself in the user´s file system or a parent.
    """
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    path = models.CharField(max_length=200, null=True, blank=True)
    name = models.CharField(max_length=200)

    def __str__(self):
        res = self.name
        curr = self
        while not curr.parent is None:
            res = curr.parent.name + '/' + res
            curr = curr.parent
        res = curr.path + res
        return res

    def clean(self):
        if not self.path and self.parent is None:
            raise ValidationError("Folder must have a parent or a path in the file system.")


class Project(models.Model):
    """
    A project created by the user.
    """
    name = models.CharField(max_length=200)
    created = models.DateTimeField('created', auto_now_add=True, editable=False)
    last_updated = models.DateTimeField('last updated', auto_now= True, editable=True)
    folders = models.ManyToManyField(Folder)

    def __str__(self):
        return self.name


class Camera(models.Model):
    """
    A collection of clips from the same location.

    Location (latitude, longitude) is given in decimal degrees.
    Latitude is limited by ±90°.
    Longitude is limited by ±180°.
    """
    latitude = models.DecimalField(
        'latitude (degrees)', max_digits=10, decimal_places=8,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )
    longitude = models.DecimalField(
        'longitude (degrees)', max_digits=11, decimal_places=8,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )
    start_time = models.DateTimeField('start time')
    end_time = models.DateTimeField('end time')

    def __str__(self):
        return "Camera at ({0}, {1})".format(self.latitude, self.longitude)

    def clean(self):
        if self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")


class Filter(models.Model):
    """
    A filter applied to cameras with a location and a time interval.

    Location (latitude, longitude) is given in decimal degrees.

    NOTE:
        Uses cascade for project so the filter will be deleted if the project is deleted.
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    cameras = models.ManyToManyField(Camera)
    name = models.CharField(max_length=200)
    latitude = models.DecimalField(
        'latitude (degrees)', max_digits=10, decimal_places=8,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )
    longitude = models.DecimalField(
        'longitude (degrees)', max_digits=11, decimal_places=8,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )
    radius = models.PositiveIntegerField('Radius (m)')
    start_time = models.DateTimeField('start time')
    end_time = models.DateTimeField('end time')

    def __str__(self):
        return self.name

    def clean(self):
        if self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")
        if self.radius > INT_MAX_VALUE:
            raise ValidationError("Radius is to large.")


class ObjectDetection(models.Model):
    """
    An execution of object detection on the camera.

    Sample rate is given in seconds.

    NOTE:
        Uses cascade for camera so the entity will be deleted if the camera is deleted.
        Sample rate equal to 0.0 means run object detection on all frames.
    """
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    sample_rate = models.FloatField('sample rate (s)', validators=[MinValueValidator(0.0)])
    start_time = models.DateTimeField('start time')
    end_time = models.DateTimeField('end time')

    def __str__(self):
        return "Object detection from {0} to {1} with {2} as sample rate"\
            .format(self.start_time, self.end_time, self.sample_rate)

    def clean(self):
        if self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")
        if self.camera.start_time > self.start_time or self.camera.end_time < self.start_time:
            raise ValidationError("Start time must be inside the camera's active interval.")
        if self.camera.start_time > self.end_time or self.camera.end_time < self.end_time:
            raise ValidationError("End time must be inside the camera's active interval.")


class Object(models.Model):
    """
    An object spotted by object detection.

    NOTE:
        Uses cascade for object detection so the object will be deleted if the object detection is deleted.
    """
    object_detection = models.ForeignKey(ObjectDetection, on_delete=models.CASCADE)
    object_class = models.CharField('class', max_length=100)
    time = models.DateTimeField()

    def __str__(self):
        return "{0} at {1}".format(self.object_class, self.time)

    def clean(self):
        if self.object_detection.start_time > self.time or self.object_detection.end_time < self.time:
            raise ValidationError("Time must be inside the interval of the object detection.")


class Clip(models.Model):
    """
    A clip from the user's file system.

    NOTE:
        Uses cascade for folder so the clip will be deleted if the folder is deleted.
        Uses protect for camera which means that a camera can't be deleted if a corresponding clip is in the database.
        When a clip  is saved the start and end time of its camera is updated.
    """
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    video_format = models.CharField('format', max_length=5)
    camera = models.ForeignKey(Camera, on_delete=models.PROTECT)
    start_time = models.DateTimeField('start time')
    end_time = models.DateTimeField('end time')

    def __str__(self):
        return self.folder.__str__() + '/' + self.name + '.' + self.video_format

    def save(self, *args, **kwargs):
        self.camera.start_time = min(self.start_time, self.camera.start_time)
        self.camera.end_time = max(self.end_time, self.camera.end_time)
        self.camera.save()
        super().save(*args, **kwargs)