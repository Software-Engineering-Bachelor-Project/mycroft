from django.test import TestCase
from backend.database_wrapper import *
from django.utils import timezone
from django.core.exceptions import ValidationError


class DatabaseWrapperProjectTest(TestCase):

    def setUp(self) -> None:
        """
        Create test project.
        """
        self.pid = create_project(name="test project")

    def test_get_project_by_id(self):
        """
        Test getting the test project by id.
        """
        p = get_project_by_id(pid=self.pid)
        assert p.name == "test project"
        assert p.id == self.pid

    def test_get_project_by_name(self):
        """
        Test getting the test project by name.
        """
        p = get_project_by_name(name="test project")
        assert p.name == "test project"
        assert p.id == self.pid

    def test_get_not_existing_project(self):
        """
        Test getting projects that doesn't exist to make sure None is returned.
        """
        assert get_project_by_id(pid=2) is None
        assert get_project_by_name(name="not a test project") is None

    def test_get_all_projects(self):
        """
        Test getting all created projects.
        """
        create_project(name="first test project")
        create_project(name="second test project")
        create_project(name="third test project")
        assert len(get_all_projects()) == 4

    def test_create_project_with_same_name(self):
        """
        Test that there can be projects with equal names.
        """
        create_project(name="test project")
        assert len(get_all_projects()) == 2

    def test_delete_project(self):
        """
        Test that a project is deleted.
        """
        delete_project(pid=self.pid)
        assert get_project_by_id(pid=self.pid) is None
        assert get_project_by_name(name="test project") is None
        assert len(get_all_projects()) == 0

    def test_rename_project(self):
        """
        Test renaming a project.
        """
        rename_project(new_name="new name for test project", pid=self.pid)
        assert get_project_by_id(pid=self.pid).name == "new name for test project"

    def test_add_and_delete_folder(self):
        """
        Test adding and deleting a folder from a project.
        """
        rid = create_root_folder(path="/home/user/", name="test_folder")
        add_folder_to_project(rid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1
        delete_folder_from_project(fid=rid, pid=self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 0

    def test_add_subfolder(self):
        """
        Test that adding a folder that is a subfolder to an already added folder doesn't work.
        """
        rid = create_root_folder(path="/home/user/", name="test_folder")
        add_folder_to_project(rid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1
        sid = create_subfolder(parent_fid=rid, name="test_subfolder")
        add_folder_to_project(sid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1

    def test_add_parent_folder(self):
        """
        Test that subfolders are removed from the project when a parent folder is added.
        """
        rid = create_root_folder(path="/home/user/", name="test_folder")
        sid1 = create_subfolder(parent_fid=rid, name="test_subfolder")
        sid2 = create_subfolder(parent_fid=rid, name="another_test_subfolder")
        add_folder_to_project(sid1, self.pid)
        add_folder_to_project(sid2, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 2
        add_folder_to_project(rid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1


class DatabaseWrapperFolderTest(TestCase):

    def setUp(self) -> None:
        """
        Create a root and subfolder.
        """
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.sid = create_subfolder(parent_fid=self.rid, name="test_subfolder")

    def test_create_existing_root_folder(self):
        """
        Test that creating a root folder with the same parameters as one that already exist doesn't result in a new
        entry in the database.
        """
        assert Folder.objects.filter(path="/home/user/", name="test_folder").count() == 1
        create_root_folder(path="/home/user/", name="test_folder")
        assert Folder.objects.filter(path="/home/user/", name="test_folder").count() == 1

    def test_create_existing_subfolder(self):
        """
        Test that creating a subfolder with the same parameters as one that already exist doesn't result in a new
        entry in the database.
        """
        assert Folder.objects.filter(parent=self.rid, name="test_subfolder").count() == 1
        create_subfolder(parent_fid=self.rid, name="test_subfolder")
        assert Folder.objects.filter(parent=self.rid, name="test_subfolder").count() == 1

    def test_get_folder_by_id(self):
        """
        Test getting a folder by id.
        """
        f = get_folder_by_id(fid=self.rid)
        assert self.rid == f.id
        assert f.path == "/home/user/"
        assert f.name == "test_folder"
        assert f.parent is None

    def test_get_folder_by_parent_and_name(self):
        """
        Test getting a folder by its parent and name.
        """
        f = get_folder_by_parent(parent_fid=self.rid, name="test_subfolder")
        assert f.id == self.sid
        assert f.name == "test_subfolder"
        assert f.path == "/home/user/test_folder/"
        assert f.parent.id == self.rid

    def test_get_folder_by_path_and_name(self):
        """
        Test getting a folder by its path and name.
        """
        f = get_folder_by_path(path="/home/user/", name="test_folder")
        assert self.rid == f.id
        assert f.path == "/home/user/"
        assert f.name == "test_folder"

    def test_get_not_existing_folder(self):
        """
        Make sure all get functions return None for invalid parameters.
        """
        assert get_folder_by_id(fid=3) is None
        assert get_folder_by_path(path="/home/not_a_user/", name="test_folder") is None
        assert get_folder_by_path(path="/home/user/", name="not_a_test_folder") is None
        assert get_folder_by_parent(parent_fid=3, name="test_subfolder") is None
        assert get_folder_by_parent(parent_fid=self.rid, name="not_a_test_subfolder") is None

    def test_get_subfolders(self):
        """
        Test getting subfolders.
        """
        create_subfolder(parent_fid=self.rid, name="level 1")
        create_subfolder(parent_fid=self.sid, name="level 2 (1)")
        fid = create_subfolder(parent_fid=self.sid, name="level 2 (2)")
        create_subfolder(parent_fid=fid, name="level 3")
        assert len(get_subfolders(fid=self.rid)) == 2
        assert len(get_subfolders_recursive(fid=self.rid)) == 5

    def test_delete_subfolder(self):
        """
        Test deleting a subfolder.
        """
        delete_folder(fid=self.sid)
        assert get_folder_by_parent(parent_fid=self.rid, name="test_subfolder") is None

    def test_delete_root_folder(self):
        """
        Test deleting a root folder.
        """
        delete_folder(fid=self.rid)
        assert get_folder_by_id(fid=self.sid) is None
        assert get_folder_by_path(path="/home/user/", name="test_folder") is None

    def test_create_root_folder_of_already_existing_subfolder(self):
        """
        Test that creating a root folder with the same parameters as an already existing subfolder doesn't result in a
        new entry in the database.
        """
        fid = create_root_folder(path="/home/user/test_folder/", name="test_subfolder")
        f = get_folder_by_id(fid=fid)
        assert len(Folder.objects.all()) == 2
        assert fid == self.sid
        assert f.parent.id == self.rid

    def test_create_folder_with_bad_path(self):
        """
        Test that trying to create a folder with a bad path results in a validation error.
        """
        self.assertRaises(ValidationError, create_root_folder, path='/home/no_(back)-slash_at_end_of_path',
                          name='valid_name')

    def test_windows_paths(self):
        """
        Test creating and getting folders that uses backslash as separators for directories works as expected.
        """
        rid = create_root_folder(path="C:\\Users\\username\\", name="test_folder")
        assert get_folder_by_path(path="C:\\Users\\username\\", name="test_folder") == \
               get_folder_by_path(path="C:/Users/username/", name="test_folder")


class DatabaseWrapperClipTest(TestCase):

    def setUp(self) -> None:
        """
        Create a folder and a clip.
        """
        self.fid = create_root_folder(path="/home/user/", name="test_folder")
        self.cid = create_clip(fid=self.fid, name="test_clip", video_format="tvf",
                               start_time=timezone.now() - datetime.timedelta(hours=1),
                               end_time=timezone.now(), latitude=Decimal(value="13.37"),
                               longitude=Decimal(value="0.42"))

    def test_get_clip_by_id(self):
        """
        Test getting a clip by id.
        """
        c = get_clip_by_id(cid=self.cid)
        assert c.folder.id == self.fid
        assert c.name == "test_clip"
        assert c.video_format == "tvf"
        assert c.id == self.cid

    def test_get_clip_by_name(self):
        """
        Test getting a clip by name and folder.
        """
        c = get_clip_by_name(fid=self.fid, name="test_clip", video_format="tvf")
        assert c.folder.id == self.fid
        assert c.name == "test_clip"
        assert c.video_format == "tvf"
        assert c.id == self.cid

    def test_get_not_existing_clip(self):
        """
        Make sure that get functions return None for clips that doesn't exist.
        """
        assert get_clip_by_id(cid=2) is None
        assert get_clip_by_name(fid=self.fid, name="not_a_test_clip", video_format="tvf") is None

    def test_get_all_clips_from_folder(self):
        """
        Test getting all clips in one folder.
        """
        sid = create_subfolder(parent_fid=self.fid, name="test_subfolder")
        create_clip(fid=sid, name="new_test_clip", video_format="tvf",
                    start_time=timezone.now() - datetime.timedelta(hours=1),
                    end_time=timezone.now(), latitude=Decimal(value="42.0099"),
                    longitude=Decimal(value="0.1337"))
        assert len(get_all_clips_from_folder(fid=self.fid)) == 1
        assert len(get_all_clips_from_folder_recursive(fid=self.fid)) == 2

    def test_delete_clip(self):
        """
        Test deleting a clip.
        """
        delete_clip(cid=self.cid)
        assert get_clip_by_id(cid=self.cid) is None
        assert get_clip_by_name(fid=self.fid, name="test_clip", video_format="tvf") is None

    def test_create_bad_clip(self):
        """
        Make sure that creating a clip with end time before start time doesn't work.
        """
        time = timezone.now()
        self.assertRaises(ValidationError, create_clip, fid=self.fid, name="valid_name", video_format="tvf",
                          start_time=time, end_time=time - datetime.timedelta(microseconds=1),
                          latitude=Decimal(value="13.37"), longitude=Decimal(value="0.42"))


class DatabaseWrapperCameraTest(TestCase):

    def setUp(self) -> None:
        """
        Create a folder and a clip.
        """
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.now() - datetime.timedelta(hours=1)
        self.et = timezone.now()
        self.fid = create_root_folder(path="/home/user/", name="test_folder")
        self.cid = create_clip(fid=self.fid, name="test_clip", video_format="tvf", start_time=self.st, end_time=self.et,
                               latitude=self.lat, longitude=self.lon)

    def test_get_camera(self):
        """
        Test getting a camera by id and location.
        """
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        assert cm.start_time == self.st
        assert cm.end_time == self.et
        assert get_camera_by_id(cmid=cm.id) == cm

    def test_delete_camera(self):
        """
        Test deleting a camera.
        """
        delete_clip(cid=self.cid)
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        delete_camera(cmid=cm.id)
        assert get_camera_by_location(latitude=self.lat, longitude=self.lon) is None
        assert get_camera_by_id(cmid=cm.id) is None

    def test_time_updates_when_adding_clip(self):
        """
        Test that the cameras time interval updates when a new clip is created.
        """
        new_st = self.st - datetime.timedelta(hours=1)
        new_et = self.et + datetime.timedelta(hours=1)
        self.cid = create_clip(fid=self.fid, name="before", video_format="tvf", start_time=new_st, end_time=self.st,
                               latitude=self.lat, longitude=self.lon)
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        assert cm.start_time == new_st
        assert cm.end_time == self.et
        self.cid = create_clip(fid=self.fid, name="after", video_format="tvf", start_time=self.et, end_time=new_et,
                               latitude=self.lat, longitude=self.lon)
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        assert cm.start_time == new_st
        assert cm.end_time == new_et

    def test_add_clips_to_same_camera(self):
        """
        Test that clips are added to the same camera if they are from the same location.
        """
        create_clip(fid=self.fid, name="another_test_clip", video_format="tvf",
                    start_time=self.st - datetime.timedelta(hours=1), end_time=self.st, latitude=self.lat,
                    longitude=self.lon)
        assert len(Camera.objects.all()) == 1


class DatabaseWrapperFilterTest(TestCase):

    def setUp(self) -> None:
        """
        Create a folder, clip, project and filter.
        """
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.cid = create_clip(fid=self.rid, name="test_clip", video_format="tvf",
                               start_time=timezone.now() - datetime.timedelta(hours=1),
                               end_time=timezone.now(), latitude=Decimal(value="13.37"),
                               longitude=Decimal(value="0.42"))
        self.pid = create_project(name="test_project")
        self.fid = create_filter(pid=self.pid, name="test_filter")
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.st = timezone.now() - datetime.timedelta(hours=1)
        self.et = timezone.now()

    def test_get_filter(self):
        """
        Test getting a filter by id.
        """
        f = get_filter_by_id(fid=self.fid)
        assert f.name == "test_filter"

    def test_get_all_filters(self):
        """
        Test getting all filters from a project.
        """
        create_filter(pid=self.pid, name="new_test_filter")
        assert len(get_all_filters_from_project(pid=self.pid)) == 2

    def test_delete_filter(self):
        """
        Test deleting a filter.
        """
        delete_filter(fid=self.fid)
        assert get_filter_by_id(fid=self.fid) is None

    def test_add_and_remove_camera_in_filter(self):
        """
        Test adding and removing a camera from a filter.
        """
        cm = get_camera_by_location(latitude=Decimal(value="13.37"), longitude=Decimal(value="0.42"))
        add_camera_to_filter(fid=self.fid, cmid=cm.id)
        assert len(get_all_cameras_in_filter(fid=self.fid)) == 1
        remove_camera_from_filter(fid=self.fid, cmid=cm.id)
        assert len(get_all_cameras_in_filter(fid=self.fid)) == 0

    def test_deleted_camera_is_removed_from_filter(self):
        """
        Test that deleted cameras are removed from filter.
        """
        cm = get_camera_by_location(latitude=Decimal(value="13.37"), longitude=Decimal(value="0.42"))
        add_camera_to_filter(fid=self.fid, cmid=cm.id)
        delete_clip(cid=self.cid)
        delete_camera(cmid=cm.id)
        assert len(get_all_cameras_in_filter(fid=self.fid)) == 0

    def test_modify_filter(self):
        """
        Test modifying fields in filter.
        """
        # Change name
        modify_filter(fid=self.fid, name="new_name")
        f = get_filter_by_id(self.fid)
        assert f.name == "new_name"

        # Change start and end time.
        modify_filter(fid=self.fid, start_time=self.st, end_time=self.et)
        f = get_filter_by_id(self.fid)
        assert f.start_time == self.st
        assert f.end_time == self.et
        assert f.radius is None

        # Change position and radius.
        modify_filter(fid=self.fid, latitude=self.lat, longitude=self.lon, radius=1337)
        f = get_filter_by_id(self.fid)
        assert f.latitude == self.lat
        assert f.longitude == self.lon
        assert f.radius == 1337

        # Change start time.
        modify_filter(fid=self.fid, start_time=self.st + datetime.timedelta(seconds=42))
        f = get_filter_by_id(self.fid)
        assert f.start_time == self.st + datetime.timedelta(seconds=42)

        # Adding and removing objects.
        modify_filter(fid=self.fid, add_classes=["test_object", "another_test_object"])
        assert len(get_all_classes_in_filter(fid=self.fid)) == 2
        modify_filter(fid=self.fid, add_classes=["test_object"])
        assert len(get_all_classes_in_filter(fid=self.fid)) == 2
        modify_filter(fid=self.fid, remove_classes=["test_object"])
        assert len(get_all_classes_in_filter(fid=self.fid)) == 1
        modify_filter(fid=self.fid, add_classes=["test_object"], remove_classes=["test_object"])
        assert len(get_all_classes_in_filter(fid=self.fid)) == 1

    def test_bad_modification_of_filter(self):
        """
        Make sure that modifying a filter to have end time before start time raises a validation error.
        """
        self.assertRaises(ValidationError, modify_filter, fid=self.fid, start_time=self.st,
                          end_time=self.st-datetime.timedelta(microseconds=1))


class DatabaseWrapperObjectDetectionTest(TestCase):

    def setUp(self) -> None:
        """
        Create a folder, clip and object detection.
        """
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.cid = create_clip(fid=self.rid, name="test_clip", video_format="tvf",
                               start_time=timezone.now() - datetime.timedelta(hours=1),
                               end_time=timezone.now(), latitude=Decimal(value="13.37"),
                               longitude=Decimal(value="0.42"))
        self.cmid = get_camera_by_location(latitude=Decimal(value="13.37"), longitude=Decimal(value="0.42")).id
        self.st = timezone.now() - datetime.timedelta(hours=0.5)
        self.et = timezone.now() - datetime.timedelta(hours=0.25)
        self.odid = create_object_detection(cmid=self.cmid, sample_rate=0.5, start_time=self.st, end_time=self.et,
                                            objects=[("test_object", self.st + datetime.timedelta(minutes=5))])

    def test_get_object_detection(self):
        """
        Test getting an object detection by id.
        """
        od = get_object_detection_by_id(odid=self.odid)
        assert od.id == self.odid
        assert od.sample_rate == 0.5
        assert od.start_time == self.st
        assert od.end_time == self.et

    def test_delete_object_detection(self):
        """
        Test deleting an object detection.
        """
        delete_object_detection(odid=self.odid)
        assert get_object_detection_by_id(odid=self.odid) is None

    def test_get_objects_in_detection(self):
        """
        Test getting objects in an object detection by filtering on classes and time intervals.
        """
        add_objects_to_detection(odid=self.odid,
                                 objects=[("test_object", self.st + datetime.timedelta(minutes=1)),
                                          ("another_test_object", self.st + datetime.timedelta(minutes=10)),
                                          ("yet_another_test_object", self.st + datetime.timedelta(minutes=11))])
        assert len(get_objects_in_detection(odid=self.odid)) == 4
        assert len(get_objects_in_detection(odid=self.odid, object_classes=["test_object", "another_test_object"])) == 3
        assert len(get_objects_in_detection(odid=self.odid, start_time=self.st + datetime.timedelta(minutes=9))) == 2
        assert len(get_objects_in_detection(odid=self.odid, start_time=self.st + datetime.timedelta(minutes=6),
                                            end_time=self.st + datetime.timedelta(minutes=8))) == 0
        assert len(get_objects_in_detection(odid=self.odid, start_time=self.st + datetime.timedelta(minutes=4),
                                            end_time=self.st + datetime.timedelta(minutes=12),
                                            object_classes=["test_object"])) == 1

    def test_get_objects_in_camera(self):
        """
        Test getting objects in a camera by filtering on classes and time intervals.
        """
        odid = create_object_detection(cmid=self.cmid, sample_rate=0.5, start_time=self.et,
                                       end_time=self.et + datetime.timedelta(minutes=10),
                                       objects=[("test_object", self.et + datetime.timedelta(minutes=5))])
        add_objects_to_detection(odid=odid,
                                 objects=[("test_object", self.et + datetime.timedelta(minutes=1)),
                                          ("another_test_object", self.et + datetime.timedelta(minutes=7)),
                                          ("yet_another_test_object", self.et + datetime.timedelta(minutes=8))])
        assert len(get_objects_in_camera(cmid=self.cmid)) == 5
        assert len(get_objects_in_camera(cmid=self.cmid, object_classes=["test_object"])) == 3
        assert len(get_objects_in_camera(cmid=self.cmid, start_time=self.st + datetime.timedelta(minutes=5),
                                         end_time=self.et + datetime.timedelta(minutes=2))) == 2
        assert len(get_objects_in_camera(cmid=self.cmid, end_time=self.et)) == 1
        assert len(get_objects_in_camera(cmid=self.cmid, start_time=self.et)) == 4

    def test_bad_object_detection(self):
        """
        Test creating bad object detections.
        """
        # Create object detection with time interval outside of the camera's time interval.
        self.assertRaises(ValidationError, create_object_detection, cmid=self.cmid, sample_rate=0.5,
                          start_time=self.st - datetime.timedelta(hours=2), end_time=self.et)
        # Create an object detection with a detected object outside of the object detection's time interval.
        self.assertRaises(ValidationError, create_object_detection, cmid=self.cmid, sample_rate=0.5, start_time=self.st,
                          end_time=self.et, objects=[("valid_test_object", self.st - datetime.timedelta(minutes=5))])
