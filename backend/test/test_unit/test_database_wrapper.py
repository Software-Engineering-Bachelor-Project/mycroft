from django.db.models import ProtectedError
from django.test import TestCase
from backend.database_wrapper import *
from django.utils import timezone
from django.core.exceptions import ValidationError

"""
The Database Wrapper and the database has a close communication and will therefore be regarded as a "unit"
since it is the bottom unit no integration tests will be performed on it 
"""


class BaseTestCases:
    """
    The following classes specifies a basic setup of the database for each type of test
    """

    class ProjectTest(TestCase):
        def setUp(self) -> None:
            """
            Create test project.
            """
            self.pid = create_project(name="test project")

    class FolderTest(TestCase):
        def setUp(self) -> None:
            """
            Create a root and subfolder.
            """
            self.r_path = "/home/user/"
            self.r_name = "test_folder"
            self.s_name = "test_subfolder"

            self.rid = create_root_folder(path=self.r_path, name=self.r_name)
            self.sid = create_subfolder(parent_fid=self.rid, name=self.s_name)

    class ClipTest(TestCase):
        def setUp(self) -> None:
            """
            Create a folder and a clip.
            """
            self.lat = Decimal(value="13.37")
            self.lon = Decimal(value="0.42")
            self.st = timezone.now() - timezone.timedelta(hours=1)
            self.et = timezone.now()
            self.fid = create_root_folder(path="/home/user/", name="test_folder")
            self.cid = create_clip(fid=self.fid, name="test_clip", video_format="tvf", start_time=self.st,
                                   end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                                   frame_rate=42.0)

    class FilterTest(TestCase):
        def setUp(self) -> None:
            """
            Create a folder, clip, project and filter.
            """
            self.rid = create_root_folder(path="/home/user/", name="test_folder")
            self.lat = Decimal(value="13.37")
            self.lon = Decimal(value="0.42")
            self.cid = create_clip(fid=self.rid, name="test_clip", video_format="tvf",
                                   start_time=timezone.now() - timezone.timedelta(hours=1),
                                   end_time=timezone.now(), latitude=self.lat,
                                   longitude=self.lon, width=256, height=240, frame_rate=42.0)
            self.pid = create_project(name="test_project")
            self.fid = create_filter(pid=self.pid)

            self.st = timezone.now() - timezone.timedelta(hours=1)
            self.et = timezone.now()

    class ObjectDetectionTest(TestCase):
        def setUp(self) -> None:
            """
            Create a folder, clip and object detection.
            """
            self.rid = create_root_folder(path="/home/user/", name="test_folder")
            self.cid = create_clip(fid=self.rid, name="test_clip", video_format="tvf",
                                   start_time=timezone.now() - timezone.timedelta(hours=1),
                                   end_time=timezone.now(), latitude=Decimal(value="13.37"),
                                   longitude=Decimal(value="0.42"), width=256, height=240, frame_rate=42.0)
            self.cmid = get_camera_by_location(latitude=Decimal(value="13.37"), longitude=Decimal(value="0.42")).id
            self.st = timezone.now() - timezone.timedelta(hours=0.5)
            self.et = timezone.now() - timezone.timedelta(hours=0.25)
            self.odid = create_object_detection(cmid=self.cmid, sample_rate=0.5, start_time=self.st, end_time=self.et,
                                                objects=[("test_object", self.st + timezone.timedelta(minutes=5))])


class CreateProjectTest(BaseTestCases.ProjectTest):
    def test_create_project(self):
        """
        Test that a project have been created
        """
        self.assertIsNotNone(self.pid)


class GetProjectByIdTest(BaseTestCases.ProjectTest):
    def test_existing_id(self):
        """
        Test getting with an existing project by id.
        """
        p = get_project_by_id(pid=self.pid)
        self.assertEqual(p.name, "test project")
        self.assertEqual(p.id, self.pid)

    def test_nonexistent_id(self):
        """
        Test that an an nonexistent pid results in None being returned
        """
        p = get_project_by_id(2)
        self.assertIsNone(p)


class GetProjectByNameTest(BaseTestCases.ProjectTest):

    def single_existing_name(self):
        """
        Test getting the test project by name.
        """
        p = get_project_by_name(name="test project")
        self.assertEqual(p.name, "test project")
        self.assertEqual(p.id, self.pid)

    # TODO Add test for multiple matching names
    # TODO Add test for a nonexistent name


class GetAllProjectsTest(BaseTestCases.ProjectTest):
    def test_all(self):
        """
        Test getting all created projects.
        """
        create_project(name="first test project")
        create_project(name="second test project")
        create_project(name="third test project")
        assert len(get_all_projects()) == 4

    # TODO: add test for no existing projects


class DeleteProjectTest(BaseTestCases.ProjectTest):
    def test_existing_pid(self):
        """
        Test that a project is deleted.
        """
        delete_project(pid=self.pid)
        self.assertIsNone(get_project_by_id(pid=self.pid))
        self.assertIsNone(get_project_by_name(name="test project"))
        self.assertEqual(len(get_all_projects()), 0)

    def test_non_existing_project(self):
        """
        Test that no project is deleted when a non existing project id is given.
        """
        delete_project(pid=1337)
        self.assertEqual(len(get_all_projects()), 1)


class RenameProjectTest(BaseTestCases.ProjectTest):
    def test_rename_project(self):
        """
        Test renaming a project.
        """
        rename_project(new_name="new name for test project", pid=self.pid)
        self.assertEqual(get_project_by_id(pid=self.pid).name, "new name for test project")


class AddFolderToProjectTest(BaseTestCases.ProjectTest):
    def setUp(self) -> None:
        super().setUp()
        self.rid = create_root_folder(path="/home/user/", name="test_folder")

    def test_existing_rid_existing_pid(self):
        """
        Test adding a folder to a project where the folder and the project exists
        """
        add_folder_to_project(self.rid, self.pid)
        self.assertEqual(len(get_folders_in_project(pid=self.pid)), 1)

    def test_sub_folder(self):
        """
        Test that adding a folder that is a subfolder to an already added folder doesn't work.
        """
        sid = create_subfolder(parent_fid=self.rid, name="test_subfolder")
        add_folder_to_project(sid, self.pid)
        self.assertEqual(len(get_folders_in_project(pid=self.pid)), 1)

    def test_add_parent_folder(self):
        """
        Test that sub folders are removed from the project when a parent folder is added.
        """
        sid1 = create_subfolder(parent_fid=self.rid, name="test_subfolder")
        sid2 = create_subfolder(parent_fid=self.rid, name="another_test_subfolder")
        add_folder_to_project(sid1, self.pid)
        add_folder_to_project(sid2, self.pid)
        g = get_folders_in_project(pid=self.pid)
        self.assertEqual(len(g), 2)
        add_folder_to_project(self.rid, self.pid)
        self.assertEqual(len(get_folders_in_project(pid=self.pid)), 1)

    # TODO add tests for existing rid, nonexistent pid
    # TODO add tests for nonexistent rid, existent pid
    # TODO add tests for nonexistent rid, nonexistent pid


class DeleteFolderFromProjectTest(BaseTestCases.ProjectTest):
    def setUp(self) -> None:
        super().setUp()
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        add_folder_to_project(self.rid, self.pid)

    def test_existing_rid_existing_pid(self):
        """
        Test deleting a folder from a project where the folder is in the project
        """
        delete_folder_from_project(fid=self.rid, pid=self.pid)
        self.assertEqual(len(get_folders_in_project(pid=self.pid)), 0)

    def test_folder_not_in_project(self):
        fid = create_root_folder(path="/home/user2/", name="test_folder")
        delete_folder_from_project(fid=fid, pid=self.pid)
        self.assertEqual(len(get_folders_in_project(pid=self.pid)), 1)

    # TODO add test for existing rid, nonexistent pid
    # TODO add test for nonexistent rid, existent pid
    # TODO add test for nonexistent rid, nonexistent pid


class GetFoldersInProjectTest(BaseTestCases.ProjectTest):
    def setUp(self) -> None:
        """
        Create project with folders
        """
        self.name = "test_folder"
        self.path = "/home/user/"
        self.rid = create_root_folder(path=self.path, name=self.name)
        self.pid = create_project(name="test project")
        add_folder_to_project(self.rid, self.pid)

    def test_valid_pid_one_folder(self):
        """
        Test that a valid pid to a project with one folder returns the folder
        """
        self.assertEqual(len(get_folders_in_project(self.pid)), 1)

    # TODO: add test for a project with several folders
    # TODO: add test for a nonexistent project
    # TODO: add test for a project without folders


class GetAllFiltersFromProjectTest(BaseTestCases.ProjectTest):
    def setUp(self) -> None:
        """
        Create project and filter.
        """
        super().setUp()
        self.fid = create_filter(pid=self.pid)

    def test_existing_filter(self):
        """
        Test getting all filters from a project where there exist filters.
        """
        assert len(get_all_filters_from_project(pid=self.pid)) == 1

    # TODO add test for project without any filters


class CreateRootFolderTest(BaseTestCases.FolderTest):
    def test_valid_path_valid_name(self):
        """
        Test that it is possible to create a root folder when given a valid path and name
        """
        self.assertEqual(Folder.objects.filter(path=self.r_path, name=self.r_name).count(), 1)

    def test_existing_root_folder(self):
        """
        Test that creating a root folder with the same parameters as one that already exist doesn't result in a new
        entry in the database.
        """
        self.rid = create_root_folder(path=self.r_path, name=self.r_name)
        self.assertEqual(Folder.objects.filter(path=self.r_path, name=self.r_name).count(), 1)

    def test_create_root_folder_of_already_existing_subfolder(self):
        """
        Test that creating a root folder with the same parameters as an already existing subfolder doesn't result in a
        new entry in the database.
        """
        fid = create_root_folder(path=self.r_path + self.r_name + '/', name="test_subfolder")
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


class CreateSubFolderTest(BaseTestCases.FolderTest):
    def test_existing_fid_valid_name(self):
        """
        Test that a sub folder has been created
        """
        self.assertEqual(Folder.objects.filter(parent=self.rid, name=self.s_name).count(), 1)

    def test_existing_subfolder(self):
        """
        Test that creating a subfolder with the same parameters as one that already exist doesn't result in a new
        entry in the database.
        """
        self.assertEqual(Folder.objects.filter(parent=self.rid, name="test_subfolder").count(), 1)
        self.sid = create_subfolder(parent_fid=self.rid, name=self.s_name)
        self.assertEqual(Folder.objects.filter(parent=self.rid, name=self.s_name).count(), 1)

    # TODO: Test a parent_fid that dont exist


class GetFolderByIdTest(BaseTestCases.FolderTest):
    def test_existing_fid(self):
        """
        Test a fid that exist
        """
        f = get_folder_by_id(fid=self.rid)
        self.assertEqual(f.id, self.rid)
        self.assertEqual(f.path, self.r_path)
        self.assertEqual(f.name, self.r_name)
        self.assertIsNone(f.parent)

    def test_nonexistent_fid(self):
        """
        Test a fid that dont exist
        """
        assert get_folder_by_id(fid=3) is None


class GetFolderByPathTest(BaseTestCases.FolderTest):
    def existing_path_existing_name(self):
        """
        Test getting a folder by its path and name.
        """
        f = get_folder_by_path(path="/home/user/", name="test_folder")
        self.assertEqual(f.id, self.rid)
        self.assertEqual(f.path, self.r_path)
        self.assertEqual(f.name, self.r_name)
        self.assertIsNone(f.parent)

    def existing_path_nonexistent_name(self):
        """
        Test for a path that match a folder and a name that dont match
        """
        self.assertIsNone(get_folder_by_path(path=self.r_path, name="not_a_test_folder"))

    def nonexistent_path_existing_name(self):
        """
        Test for a path that dont match a folder and a name that match
        """
        self.assertIsNone(get_folder_by_path(path="/home/not_a_user/", name=self.r_name))

    def nonexistent_path_nonexistent_name(self):
        """
        Test for a path that dont match a folder and a name that dont match
        """
        self.assertIsNone(get_folder_by_path(path="/home/not_a_user/", name="not_a_test_folder"))


class FolderByParentTest(BaseTestCases.FolderTest):
    def existing_parent_existing_name(self):
        """
        Test getting a folder by its parent and name.
        """
        f = get_folder_by_parent(parent_fid=self.rid, name="test_subfolder")
        self.assertEqual(f.id, self.rid)
        self.assertEqual(f.path, self.r_path)
        self.assertEqual(f.name, self.r_name)
        self.assertIsNone(f.parent)

    def existing_parent_nonexistent_name(self):
        """
        Test for a parent that match a folder and a name that dont match
        """
        self.assertIsNone(get_folder_by_parent(parent_fid=self.rid, name="not_a_test_folder"))

    def nonexistent_parent_existing_name(self):
        """
        Test for a parent that dont match a folder and a name that match
        """
        self.assertIsNone(get_folder_by_parent(parent_fid=2, name=self.r_name))

    def nonexistent_parent_nonexistent_name(self):
        """
        Test for a parent that dont match a folder and a name that dont match
        """
        self.assertIsNone(get_folder_by_parent(parent_fid=2, name="not_a_test_folder"))


class GetSubFoldersTest(BaseTestCases.FolderTest):
    def setUp(self) -> None:
        """
        Create subsubfolder
        """
        super().setUp()
        self.s_s_name = "test sub sub folder"
        self.sid2 = create_subfolder(parent_fid=self.sid, name=self.s_s_name)

    def test_existing_fid(self):
        """
        Test getting sub folders in an existing folder
        """
        self.assertEqual(len(get_subfolders(fid=self.rid)), 1)
    # TODO: Add test for non existent fid


class GetSubFoldersRecursiveTest(BaseTestCases.FolderTest):
    def setUp(self) -> None:
        """
        Create subsubfolder
        """
        super().setUp()
        self.s_s_name = "test sub sub folder"
        self.sid2 = create_subfolder(parent_fid=self.sid, name=self.s_s_name)

    def test_existing_fid(self):
        """
        Test getting sub folders in an existing folder
        """
        self.assertEqual(len(get_subfolders_recursive(fid=self.rid)), 2)
    # TODO: Add test for non existent fid


class DeleteFolderTest(BaseTestCases.FolderTest):
    def setUp(self) -> None:
        """
        Create a root and subfolder.
        """
        super().setUp()
        self.s_s_name = "test subsubfolder"
        self.sid2 = create_subfolder(parent_fid=self.sid, name=self.s_s_name)

    def test_subfolder(self):
        """
        Test deleting a subfolder.
        """
        delete_folder(fid=self.sid)
        self.assertIsNone(get_folder_by_parent(parent_fid=self.rid, name=self.s_name))

    def test_root_folder(self):
        """
        Test deleting a root folder.
        """
        delete_folder(fid=self.rid)
        self.assertIsNone(get_folder_by_parent(parent_fid=self.sid, name=self.s_s_name))
        self.assertIsNone(get_folder_by_parent(parent_fid=self.rid, name=self.s_name))
        self.assertIsNone(get_folder_by_path(path=self.r_path, name=self.r_name))

    def test_non_existing_folder(self):
        """
        Test deleting a none existing folder.
        """
        delete_folder(fid=1337)
        self.assertIs(Folder.objects.count(), 3)


class CreateClipTest(BaseTestCases.ClipTest):
    def test_correct_values(self):
        self.assertEqual(get_clip_by_id(self.cid).name, "test_clip")

    def test_bad_time(self):
        """
        Make sure that creating a clip with end time before start time doesn't work.
        """
        time = timezone.now()
        self.assertRaises(ValidationError, create_clip, fid=self.fid, name="valid_name", video_format="tvf",
                          start_time=time, end_time=time - timezone.timedelta(microseconds=1),
                          latitude=Decimal(value="13.37"), longitude=Decimal(value="0.42"), width=256, height=240,
                          frame_rate=42.0)

    def test_time_updates_when_adding_clip(self):
        """
        Test that the cameras time interval updates when a new clip is created.
        """
        new_st = self.st - timezone.timedelta(hours=1)
        new_et = self.et + timezone.timedelta(hours=1)
        self.cid = create_clip(fid=self.fid, name="before", video_format="tvf", start_time=new_st, end_time=self.st,
                               latitude=self.lat, longitude=self.lon, width=256, height=240, frame_rate=42.0)
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        self.assertEqual(cm.start_time, new_st)
        self.assertEqual(cm.end_time, self.et)
        self.cid = create_clip(fid=self.fid, name="after", video_format="tvf", start_time=self.et, end_time=new_et,
                               latitude=self.lat, longitude=self.lon, width=256, height=240, frame_rate=42.0)
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        self.assertEqual(cm.start_time, new_st)
        self.assertEqual(cm.end_time, new_et)

    def test_add_clips_to_same_camera(self):
        """
        Test that clips are added to the same camera if they are from the same location.
        """
        create_clip(fid=self.fid, name="another_test_clip", video_format="tvf",
                    start_time=self.st - timezone.timedelta(hours=1), end_time=self.st, latitude=self.lat,
                    longitude=self.lon, width=256, height=240, frame_rate=42.0)
        self.assertEqual(len(Camera.objects.all()), 1)

    # TODO: Add tests for bad parameters


class GetClipByIdTest(BaseTestCases.ClipTest):
    def test_existing_cid(self):
        """
        Test getting a clip by id.
        """
        c = get_clip_by_id(cid=self.cid)
        self.assertEqual(c.folder.id, self.fid)
        self.assertEqual(c.name, "test_clip")
        self.assertEqual(c.video_format, "tvf")
        self.assertEqual(c.id, self.cid)

    def test_nonexistent_cid(self):
        """
        Make sure that get function return None for clips that doesn't exist.
        """
        self.assertIsNone(get_clip_by_id(cid=2))


class GetClipByNameTest(BaseTestCases.ClipTest):
    def test_existing_name(self):
        """
        Test getting a clip by name.
        """
        c = get_clip_by_name(fid=self.fid, name="test_clip", video_format="tvf")
        self.assertEqual(c.folder.id, self.fid)
        self.assertEqual(c.name, "test_clip")
        self.assertEqual(c.video_format, "tvf")
        self.assertEqual(c.id, self.cid)

    def test_nonexistent_name(self):
        """
        Make sure that get function return None for names that doesn't exist.
        """
        self.assertIsNone(get_clip_by_name(fid=self.fid, name="not_a_test_clip", video_format="tvf"))


class DeleteClipTest(BaseTestCases.ClipTest):
    def test_existing_cid(self):
        """
        Test deleting a clip.
        """
        delete_clip(cid=self.cid)
        self.assertIsNone(get_clip_by_id(cid=self.cid))
        self.assertIsNone(get_clip_by_name(fid=self.fid, name="test_clip", video_format="tvf"))

    def test_non_existing_cid(self):
        """
        Test deleting a non existing clip.
        """
        delete_clip(cid=1337)
        self.assertEqual(Clip.objects.count(), 1)


class GetAllClipsFromFolderTest(BaseTestCases.ClipTest):
    def test_existing_fid(self):
        """
        Test getting all clips in one folder.
        """
        sid = create_subfolder(parent_fid=self.fid, name="test_subfolder")
        create_clip(fid=sid, name="new_test_clip", video_format="tvf",
                    start_time=timezone.now() - timezone.timedelta(hours=1),
                    end_time=timezone.now(), latitude=Decimal(value="42.0099"),
                    longitude=Decimal(value="0.1337"), width=256, height=240, frame_rate=42.0)
        self.assertEqual(len(get_all_clips_from_folder(fid=self.fid)), 1)

    # TODO: add test for nonexistent fid


class GetAllClipsFromFolderRecursiveTest(BaseTestCases.ClipTest):
    def setUp(self) -> None:
        """
        Create a folder and a clip.
        """
        super().setUp()

        sid = create_subfolder(parent_fid=self.fid, name="test_subfolder")
        create_clip(fid=sid, name="new_test_clip", video_format="tvf",
                    start_time=timezone.now() - timezone.timedelta(hours=1),
                    end_time=timezone.now(), latitude=Decimal(value="42.0099"),
                    longitude=Decimal(value="0.1337"), width=256, height=240, frame_rate=42.0)

    def test_existing_fid(self):
        """
        Test getting all clips in one folder and its subfolders.
        """
        self.assertEqual(len(get_all_clips_from_folder_recursive(fid=self.fid)), 2)

    # TODO: add test for nonexistent fid


class GetCameraByIDTest(BaseTestCases.ClipTest):
    def test_existing_cmid(self):
        """
        Test getting a camera with an existing cmid
        """
        cm = get_camera_by_location(self.lat, self.lon)
        self.assertEqual(cm.start_time, self.st)
        self.assertEqual(cm.end_time, self.et)
        self.assertEqual(get_camera_by_id(cm.id), cm)

    # TODO add test for nonexisting cmid


class GetCameraByLocationTest(BaseTestCases.ClipTest):
    def test_existing_location(self):
        """
        Test getting a camera with an correct location
        """
        cm = get_camera_by_location(self.lat, self.lon)
        self.assertEqual(self.st, cm.start_time)
        self.assertEqual(self.et, cm.end_time)

    # TODO add test for  nonexisting location


class DeleteCameraTest(BaseTestCases.ClipTest):
    def test_existing_cmid(self):
        """
        Test deleting a camera.
        """
        delete_clip(cid=self.cid)  # Delete clip related to camera.
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        delete_camera(cmid=cm.id)
        self.assertIsNone(get_camera_by_location(latitude=self.lat, longitude=self.lon))
        self.assertIsNone(get_camera_by_id(cmid=cm.id))

    def test_clip_still_exist(self):
        """
        Test deleting a camera still referenced by a clip.
        """
        cm = get_camera_by_location(latitude=self.lat, longitude=self.lon)
        self.assertRaises(ProtectedError, delete_camera, cmid=cm.id)

    def test_non_existing_cmid(self):
        """
        Test deleting a non existing camera.
        """
        delete_camera(cmid=1337)
        self.assertEqual(Camera.objects.count(), 1)


class CreateFilterTest(BaseTestCases.FilterTest):
    def test_existing_pid(self):
        """
        Test creating a filter with an existing pid
        """
        f = get_filter_by_id(self.fid)
        self.assertEqual(f.id, self.fid)


class GetFilterByIdTest(BaseTestCases.FilterTest):
    def test_existing_fid(self):
        """
        Test getting a filter by id.
        """
        f = get_filter_by_id(fid=self.fid)
        self.assertEqual(f.id, self.fid)
    # TODO: Test nonexistent fid


class DeleteFilterTest(BaseTestCases.FilterTest):
    def test_existing_fid(self):
        """
        Test deleting a filter.
        """
        delete_filter(fid=self.fid)
        self.assertIsNone(get_filter_by_id(fid=self.fid))

    def test_non_existing_fid(self):
        """
        Test deleting a non existing filter.
        """
        delete_filter(fid=1337)
        self.assertEqual(Filter.objects.count(), 1)


class ModifyFilterTest(BaseTestCases.FilterTest):

    def test_modify_time(self):
        """
        Test modifying start and endtime in filter.
        """
        modify_filter(fid=self.fid, start_time=self.st, end_time=self.et)
        f = get_filter_by_id(self.fid)
        self.assertEqual(f.start_time, self.st)
        self.assertEqual(f.end_time, self.et)

    def test_modify_start_time(self):
        """
        Test modifying start time in filter.
        """
        modify_filter(fid=self.fid, start_time=self.st + timezone.timedelta(seconds=42))
        f = get_filter_by_id(self.fid)
        self.assertEqual(f.start_time, self.st + timezone.timedelta(seconds=42))

    def test_modify_objects(self):
        """
        Test modifying Adding and removing objects in filter.
        """
        modify_filter(fid=self.fid, add_classes=["test_object", "another_test_object"])
        self.assertEqual(len(get_all_classes_in_filter(fid=self.fid)), 2)

        modify_filter(fid=self.fid, add_classes=["test_object"])
        self.assertEqual(len(get_all_classes_in_filter(fid=self.fid)), 2)

        modify_filter(fid=self.fid, remove_classes=["test_object"])
        self.assertEqual(len(get_all_classes_in_filter(fid=self.fid)), 1)

        modify_filter(fid=self.fid, add_classes=["test_object"], remove_classes=["test_object"])
        self.assertEqual(len(get_all_classes_in_filter(fid=self.fid)), 1)

    def test_modify_quality(self):
        modify_filter(fid=self.fid, min_height=10, min_width=12, min_frame_rate=90)
        filter = get_filter_by_id(self.fid)
        self.assertEqual(filter.min_frame_rate, 90)
        self.assertEqual(filter.min_height, 10)
        self.assertEqual(filter.min_width, 12)

    def test_bad_time(self):
        """
        Make sure that modifying a filter to have end time before start time raises a validation error.
        """
        self.assertRaises(ValidationError, modify_filter, fid=self.fid, start_time=self.st,
                          end_time=self.st - timezone.timedelta(microseconds=1))


class GetObjectsInCameraTest(BaseTestCases.ObjectDetectionTest):
    def test_get_objects_in_camera(self):
        """
        Test getting objects in a camera by filtering on classes and time intervals.
        """
        odid = create_object_detection(cmid=self.cmid, sample_rate=0.5, start_time=self.et,
                                       end_time=self.et + timezone.timedelta(minutes=10),
                                       objects=[("test_object", self.et + timezone.timedelta(minutes=5))])
        add_objects_to_detection(odid=odid,
                                 objects=[("test_object", self.et + timezone.timedelta(minutes=1)),
                                          ("another_test_object", self.et + timezone.timedelta(minutes=7)),
                                          ("yet_another_test_object", self.et + timezone.timedelta(minutes=8))])
        self.assertEqual(len(get_objects_in_camera(cmid=self.cmid)), 5)
        self.assertEqual(len(get_objects_in_camera(cmid=self.cmid, object_classes=["test_object"])), 3)
        self.assertEqual(len(get_objects_in_camera(cmid=self.cmid, start_time=self.st + timezone.timedelta(minutes=5),
                                                   end_time=self.et + timezone.timedelta(minutes=2))), 2)
        self.assertEqual(len(get_objects_in_camera(cmid=self.cmid, end_time=self.et)), 1)
        self.assertEqual(len(get_objects_in_camera(cmid=self.cmid, start_time=self.et)), 4)


class CreateObjectDetectionTest(BaseTestCases.ObjectDetectionTest):
    def test_existing_odid(self):
        """
        Test deleting an object detection.
        """
        delete_object_detection(odid=self.odid)
        self.assertIsNone(get_object_detection_by_id(odid=self.odid))

    def test_bad_object_detection(self):
        """
        Test creating bad object detections.
        """
        # Create object detection with time interval outside of the camera's time interval.
        self.assertRaises(ValidationError, create_object_detection, cmid=self.cmid, sample_rate=0.5,
                          start_time=self.st - timezone.timedelta(hours=2), end_time=self.et)
        # Create an object detection with a detected object outside of the object detection's time interval.
        self.assertRaises(ValidationError, create_object_detection, cmid=self.cmid, sample_rate=0.5, start_time=self.st,
                          end_time=self.et, objects=[("valid_test_object", self.st - timezone.timedelta(minutes=5))])


class GetObjectDetectionByIDTest(BaseTestCases.ObjectDetectionTest):
    def test_existing_odid(self):
        """
        Test getting an object detection by id.
        """
        od = get_object_detection_by_id(odid=self.odid)
        self.assertEqual(od.id, self.odid)
        self.assertEqual(od.sample_rate, 0.5)
        self.assertEqual(od.start_time, self.st)
        self.assertEqual(od.end_time, self.et)
    # TODO: Test Bad odid


class DeleteObjectDetectionTest(BaseTestCases.ObjectDetectionTest):
    def test_existing_odid(self):
        """
        Test deleting an object detection.
        """
        delete_object_detection(odid=self.odid)
        self.assertIsNone(get_object_detection_by_id(odid=self.odid))

    def test_non_existing_odid(self):
        """
        Test deleting a non existing object detection.
        """
        delete_object_detection(odid=1337)
        self.assertEqual(ObjectDetection.objects.count(), 1)


class AddObjectsToDetectionTest(BaseTestCases.ObjectDetectionTest):
    def test_(self):
        pass  # TODO: Implement this


class GetObjectsInDetectionTest(BaseTestCases.ObjectDetectionTest):
    def test_objects(self):
        """
        Test getting objects in an object detection by filtering on classes and time intervals.
        """
        add_objects_to_detection(odid=self.odid,
                                 objects=[("test_object", self.st + timezone.timedelta(minutes=1)),
                                          ("another_test_object", self.st + timezone.timedelta(minutes=10)),
                                          ("yet_another_test_object", self.st + timezone.timedelta(minutes=11))])
        assert len(get_objects_in_detection(odid=self.odid)) == 4
        assert len(get_objects_in_detection(odid=self.odid, object_classes=["test_object", "another_test_object"])) == 3
        assert len(get_objects_in_detection(odid=self.odid, start_time=self.st + timezone.timedelta(minutes=9))) == 2
        assert len(get_objects_in_detection(odid=self.odid, start_time=self.st + timezone.timedelta(minutes=6),
                                            end_time=self.st + timezone.timedelta(minutes=8))) == 0
        assert len(get_objects_in_detection(odid=self.odid, start_time=self.st + timezone.timedelta(minutes=4),
                                            end_time=self.st + timezone.timedelta(minutes=12),
                                            object_classes=["test_object"])) == 1


class GetAllExcludedClipsInFilterTest(BaseTestCases.FilterTest):
    def test_base(self):
        pass  # Tested in AddExcludedCamerasToFilterTest


class GetAllIncludedClipsInFilterTest(BaseTestCases.FilterTest):
    def test_base(self):
        pass  # Tested in AddIncludedCamerasToFilterTest


class AddIncludedClipToFilterTest(BaseTestCases.FilterTest):
    def test_existing_fid(self):
        """
        Test adding a including clip to a filter.
        """
        add_included_clip_to_filter(fid=self.fid, cid=self.cid)
        self.assertEqual(len(get_all_included_clips_in_filter(fid=self.fid)), 1)

    def test_nonexistent_fid(self):
        """
        Test adding a included clip to a filter that does not exist.
        """
        self.assertRaises(AssertionError, add_included_clip_to_filter, fid=2, cid=self.cid)

    def test_duplicate(self):
        """
        Test adding a including clip to a filter multiple times.
        """
        add_included_clip_to_filter(fid=self.fid, cid=self.cid)
        add_included_clip_to_filter(fid=self.fid, cid=self.cid)
        self.assertEqual(len(get_all_included_clips_in_filter(fid=self.fid)), 1)


class AddExcludedClipsToFilterTest(BaseTestCases.FilterTest):
    def test_existing_fid(self):
        """
        Test adding a excluded clip to a filter.
        """
        add_excluded_clip_to_filter(fid=self.fid, cid=self.cid)
        self.assertEqual(len(get_all_excluded_clips_in_filter(fid=self.fid)), 1)

    def test_nonexistent_fid(self):
        """
        Test adding a excluded clip to a filter that does not exist.
        """
        self.assertRaises(AssertionError, add_excluded_clip_to_filter, fid=2, cid=self.cid)

    def test_duplicate(self):
        """
        Test adding a including clip to a filter multiple times.
        """
        add_excluded_clip_to_filter(fid=self.fid, cid=self.cid)
        add_excluded_clip_to_filter(fid=self.fid, cid=self.cid)
        self.assertEqual(len(get_all_excluded_clips_in_filter(fid=self.fid)), 1)


class RemoveIncludedClipsFromFilterTest(BaseTestCases.FilterTest):
    def test_existing_camera(self):
        """
        Test Removing a clip from a filters included cameras.
        """
        add_included_clip_to_filter(fid=self.fid, cid=self.cid)
        remove_included_clip_from_filter(fid=self.fid, cid=self.cid)
        self.assertEqual(len(get_all_included_clips_in_filter(fid=self.fid)), 0)

    def test_nonexistent_fid(self):
        """
        Test removing a included clip from a filter that does not exist.
        """
        self.assertRaises(AssertionError, remove_included_clip_from_filter, fid=2, cid=self.cid)


class RemoveExcludedClipsFromFilterTest(BaseTestCases.FilterTest):
    def test_existing_camera(self):
        """
        Test Removing a clip from a filters excluded cameras.
        """
        add_excluded_clip_to_filter(fid=self.fid, cid=self.cid)
        remove_excluded_clip_from_filter(fid=self.fid, cid=self.cid)
        self.assertEqual(len(get_all_excluded_clips_in_filter(fid=self.fid)), 0)

    def test_nonexistent_fid(self):
        """
        Test removing a excluded clip from a filter that does not exist.
        """
        self.assertRaises(AssertionError, remove_included_clip_from_filter, fid=2, cid=self.cid)


class GetAllClipsInProject(BaseTestCases.ClipTest):
    def setUp(self) -> None:
        super().setUp()
        self.pid = create_project(name="test_project")
        add_folder_to_project(self.fid, self.pid)

    def test_one_clip(self):
        """
        Test getting all clips when only one exists in a direct root folder to the project
        """
        self.assertEqual(get_all_clips_in_project(self.pid)[0].id, self.cid)

    def complex_folder_structure(self):
        """
        Tests getting all clips when clips are at different levels of folders
        """
        fid2 = create_subfolder(self.fid, "test2")
        create_clip(fid=fid2, name="test_clip2", video_format="tvf", start_time=self.st,
                    end_time=self.et, latitude=self.lat, longitude=self.lon, width=256, height=240,
                    frame_rate=42.0)

        add_folder_to_project(self.fid, self.pid)
        self.assertEqual(len(get_all_clips_in_project(self.pid)), 2)


class GetAllMatchingClipsInFilter(BaseTestCases.FilterTest):
    def setUp(self) -> None:
        super().setUp()
        add_folder_to_project(self.fid, self.pid)
        self.filter = create_filter(self.pid)

    def test_filter_without_params(self):
        """
        Test getting clips without any params in filter
        """
        clips = get_all_clips_matching_filter(self.filter)
        self.assertEqual(clips[0].id, self.cid)

    def test_inside_time_span(self):
        """
        Test getting clips where the time span has been specified and the clip is inside it
        """
        modify_filter(self.filter, start_time=timezone.now() - timezone.timedelta(hours=1), end_time=timezone.now())
        clips = get_all_clips_matching_filter(self.filter)
        self.assertEqual(clips[0].id, self.cid)

    def test_outside_time_span(self):
        """
        Test getting clips where the time span has been specified and the clip is outside it
        """
        modify_filter(self.filter, start_time=timezone.now() - timezone.timedelta(hours=3),
                      end_time=timezone.now() - timezone.timedelta(hours=2))
        clips = get_all_clips_matching_filter(self.filter)
        self.assertEqual(clips, [])
