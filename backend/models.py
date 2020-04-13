from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal

INT_MAX_VALUE = 2147483647


class Resolution(models.Model):
    """
    The Resolution of a clip
    """
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()

    def __str__(self):
        return self.id


class Folder(models.Model):
    """
    A folder in the user's file system.

    Path represents a location in the user's file system which doesn't include the name of the folder.
    All paths are stored with / as separator between directories regardless of OS.
    The last character in the path is always /.

    NOTE:
        Uses cascade for parent so the folder will be deleted if the parent is deleted (recursively).
        A folder needs to have a path to itself in the user´s file system or a parent.
    """
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    path = models.CharField(max_length=200)
    name = models.CharField(max_length=200)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['path', 'name'], name='folder path constraint')
        ]

    def __str__(self):
        res = self.name
        curr = self
        while curr.parent is not None:
            res = curr.parent.name + '/' + res
            curr = curr.parent
        res = curr.path + res
        return res

    def clean(self):
        if not self.path and self.parent is None:
            raise ValidationError("Folder must have a parent or a path in the file system.")
        if self.path and not (self.path[-1] == '/'):
            raise ValidationError("The last character in the path must be \ or / depending on OS.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Folder, self).save(*args, **kwargs)


class Project(models.Model):
    """
    A project created by the user.
    """
    name = models.CharField(max_length=200)
    created = models.DateTimeField('created', auto_now_add=True, editable=False)
    last_updated = models.DateTimeField('last updated', auto_now=True, editable=True)
    folders = models.ManyToManyField(Folder)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Project, self).save(*args, **kwargs)


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
    start_time = models.DateTimeField('start time', null=True, blank=True)
    end_time = models.DateTimeField('end time', null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['latitude', 'longitude'], name='position constraint'),
        ]

    def __str__(self):
        return "Camera at ({0}, {1})".format(self.latitude, self.longitude)

    def clean(self):
        if self.start_time is not None and self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Camera, self).save(*args, **kwargs)


class ObjectClass(models.Model):
    """
    A class of an object spotted by object detection.
    """
    object_class = models.CharField('class', max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['object_class'], name='class constraint'),
        ]

    def __str__(self):
        return self.object_class


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
    resolution = models.ForeignKey(Resolution, on_delete=models.PROTECT)
    frame_rate = models.FloatField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['folder', 'name', 'video_format'], name='clip path constraint')
        ]

    def __str__(self):
        return self.folder.__str__() + '/' + self.name + '.' + self.video_format

    def clean(self):
        if self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")

    def save(self, *args, **kwargs):
        self.full_clean()
        if self.camera.start_time is None:
            self.camera.start_time = self.start_time
        else:
            self.camera.start_time = min(self.start_time, self.camera.start_time)
        if self.camera.end_time is None:
            self.camera.end_time = self.end_time
        else:
            self.camera.end_time = max(self.end_time, self.camera.end_time)
        self.camera.save()
        super().save(*args, **kwargs)

    def clip_match_filter(self, filter) -> bool:
        """
        Does the clip match the given filter
        Note: requires that the clip is part of the same project as the filter.
        Note: Filter can not be typed since filter has not defined yet

        :param filter: The filter that the clip is matched against
        :return: Whether the clip matches the given filter
        """

        # Check if the clip within time boundaries
        if (filter.start_time is not None) and (filter.end_time is not None) and \
                not overlap(self.start_time, self.end_time, filter.start_time, filter.end_time):
            return False

        # Check if the clip has the desired resolution
        if self.resolution in filter.blacklisted_resolutions.all():
            return False

        # TODO: add support for classes
        return True


class Filter(models.Model):
    """
    A filter applied to cameras with a location and a time interval.

    Location (latitude, longitude) is given in decimal degrees.

    NOTE:
        Uses cascade for project so the filter will be deleted if the project is deleted.
        Uses protect for object class so the object class can't be deleted if the filter still exists.
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    included_clips = models.ManyToManyField(Clip, related_name="included_in_filter")
    excluded_clips = models.ManyToManyField(Clip, related_name="excluded_in_filter")
    start_time = models.DateTimeField('start time', null=True, blank=True)
    end_time = models.DateTimeField('end time', null=True, blank=True)
    classes = models.ManyToManyField(ObjectClass)
    min_frame_rate = models.PositiveIntegerField("Minimum frame Rate", null=True, blank=True)
    blacklisted_resolutions = models.ManyToManyField(Resolution)

    def __str__(self):
        return self.id

    def clean(self):
        if self.start_time is not None and self.end_time is not None and self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Filter, self).save(*args, **kwargs)


class ObjectDetection(models.Model):
    """
    An execution of object detection on the camera.

    Sample rate is given in seconds.

    NOTE:
        Uses cascade for clip so the entity will be deleted if the clip is deleted.
        Sample rate equal to 0.0 means run object detection on all frames.
    """
    clip = models.ForeignKey(Clip, on_delete=models.CASCADE)
    sample_rate = models.FloatField('sample rate (s)', validators=[MinValueValidator(0.0)])
    start_time = models.DateTimeField('start time')
    end_time = models.DateTimeField('end time')

    def __str__(self):
        return "Object detection from {0} to {1} with {2} as sample rate" \
            .format(self.start_time, self.end_time, self.sample_rate)

    def clean(self):
        if self.start_time > self.end_time:
            raise ValidationError("Start time must be before end time.")
        if self.clip.start_time > self.start_time or self.clip.end_time < self.start_time:
            raise ValidationError("Start time must be inside the camera's active interval.")
        if self.clip.start_time > self.end_time or self.clip.end_time < self.end_time:
            raise ValidationError("End time must be inside the camera's active interval.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(ObjectDetection, self).save(*args, **kwargs)


class Object(models.Model):
    """
    An object spotted by object detection.

    NOTE:
        Uses cascade for object detection so the object will be deleted if the object detection is deleted.
        Uses protect for object class so the object class can't be deleted if the object still exists.
    """
    object_detection = models.ForeignKey(ObjectDetection, on_delete=models.CASCADE)
    object_class = models.ForeignKey(ObjectClass, on_delete=models.PROTECT)
    time = models.DateTimeField()

    def __str__(self):
        return "{0} at {1}".format(self.object_class, self.time)

    def clean(self):
        if self.object_detection.start_time > self.time or self.object_detection.end_time < self.time:
            raise ValidationError("Time must be inside the interval of the object detection.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Object, self).save(*args, **kwargs)


def overlap(s1: timezone.datetime, e1: timezone.datetime, s2: timezone.datetime, e2: timezone.datetime) -> bool:
    """
    Check whether timespan 1 overlaps timespan 2
    :param s1: Start time of timespan 1
    :param e1: End time of timespan 1
    :param s2: Start time of timespan 2
    :param e2: End time of timespan 2
    :return: whether timespan 1 overlaps timespan 2
    """

    if (s1 <= s2 <= e1) or (s2 <= s1 <= e2):  # Start of one span between the start and end of the other
        return True
    if (s1 <= s2 <= e2 <= s1) or (s2 <= s1 <= e1 <= s2):  # one span is totaly within the other
        return True
    else:
        return False


class Progress(models.Model):
    """
    Keeps track of progress for a service.
    """
    total = models.PositiveIntegerField('Total')
    current = models.PositiveIntegerField('Total', default=0)

    def clean(self):
        if self.current > self.total:
            raise ValidationError("Current can't be larger than total.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Progress, self).save(*args, **kwargs)


def distance(lon1: Decimal, lat1: Decimal, lon2: Decimal, lat2: Decimal):
    """
    get the distance between point 1 and 2
    :param lon1: Longitude of point 1
    :param lat1: latitude of point 1
    :param lon2: Longitude of point 2
    :param lat2: latitude of point 2
    :return: whether timespan 1 overlaps timespan 2
    """
    return Decimal.sqrt((lon1 - lon2) ** 2 + (lat1 - lat2) ** 2)
