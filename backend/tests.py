from django.test import TestCase
from .database_wrapper import *
from django.utils import timezone
from django.core.exceptions import ValidationError


class DatabaseWrapperProjectTest(TestCase):

    def setUp(self) -> None:
        self.pid = create_project(name="test project")

    def test_get_project_by_id(self):
        p = get_project_by_id(pid=self.pid)
        assert p.name == "test project"
        assert p.id == self.pid

    def test_get_project_by_name(self):
        p = get_project_by_name(name="test project")
        assert p.name == "test project"
        assert p.id == self.pid

    def test_get_not_existing_project(self):
        assert get_project_by_id(pid=2) is None
        assert get_project_by_name(name="not a test project") is None

    def test_get_all_projects(self):
        create_project(name="first test project")
        create_project(name="second test project")
        create_project(name="third test project")
        assert len(get_all_projects()) == 4

    def test_create_project_with_same_name(self):
        create_project(name="test project")
        assert len(get_all_projects()) == 2

    def test_delete_project(self):
        delete_project(pid=self.pid)
        assert get_project_by_id(pid=self.pid) is None
        assert get_project_by_name(name="test project") is None

    def test_rename_project(self):
        rename_project(new_name="new name for test project", pid=self.pid)
        assert get_project_by_id(pid=self.pid).name == "new name for test project"

    def test_delete_folder(self):
        rid = create_root_folder(path="/home/user/", name="test_folder")
        add_folder(rid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1
        delete_folder_from_project(fid=rid, pid=self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 0

    def test_add_subfolder(self):
        rid = create_root_folder(path="/home/user/", name="test_folder")
        add_folder(rid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1
        sid = create_subfolder(parent_fid=rid, name="test_subfolder")
        add_folder(sid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1

    def test_add_parent_folder(self):
        rid = create_root_folder(path="/home/user/", name="test_folder")
        sid = create_subfolder(parent_fid=rid, name="test_subfolder")
        add_folder(sid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1
        add_folder(rid, self.pid)
        assert len(get_folders_in_project(pid=self.pid)) == 1


class DatabaseWrapperFolderTest(TestCase):

    def setUp(self) -> None:
        self.rid = create_root_folder(path="/home/user/", name="test_folder")
        self.sid = create_subfolder(parent_fid=self.rid, name="test_subfolder")

    def create_existing_root_folder(self):
        create_root_folder(path="/home/user/", name="test_folder")
        assert Folder.objects.filter(path="/home/user/", name="test_folder").count() == 1

    def create_existing_subfolder(self):
        create_subfolder(parent_fid=self.rid, name="test_subfolder")
        assert Folder.objects.filter(parent=self.rid, name="test_subfolder").count() == 1

    def test_get_folder_by_id(self):
        f = get_folder_by_id(fid=self.rid)
        assert self.rid == f.id
        assert f.path == "/home/user/"
        assert f.name == "test_folder"

    def test_get_folder_by_parent_and_name(self):
        f = get_folder_by_parent(parent_fid=self.rid, name="test_subfolder")
        assert f.id == self.sid
        assert f.name == "test_subfolder"
        assert f.parent.id == self.rid

    def test_get_folder_by_path_and_name(self):
        f = get_folder_by_path(path="/home/user/", name="test_folder")
        assert self.rid == f.id
        assert f.path == "/home/user/"
        assert f.name == "test_folder"

    def test_get_not_existing_folder(self):
        assert get_folder_by_id(fid=3) is None
        assert get_folder_by_path(path="/home/not_a_user", name="test_folder") is None
        assert get_folder_by_path(path="/home/user", name="not_a_test_folder") is None
        assert get_folder_by_parent(parent_fid=3, name="test_subfolder") is None
        assert get_folder_by_parent(parent_fid=self.rid, name="not_a_test_subfolder") is None

    def test_get_subfolders(self):
        create_subfolder(parent_fid=self.rid, name="level 1")
        create_subfolder(parent_fid=self.sid, name="level 2 (1)")
        fid = create_subfolder(parent_fid=self.sid, name="level 2 (2)")
        create_subfolder(parent_fid=fid, name="level 3")
        assert len(get_subfolders(fid=self.rid)) == 2
        assert len(get_subfolders_recursive(fid=self.rid)) == 5

    def test_delete_subfolder(self):
        delete_folder(fid=self.sid)
        assert get_folder_by_parent(parent_fid=self.rid, name="test_subfolder") is None

    def test_delete_root_folder(self):
        delete_folder(fid=self.rid)
        assert get_folder_by_id(fid=self.sid) is None
        assert get_folder_by_path(path="/home/user/", name="test_folder") is None

    def create_folder_with_bad_path(self):
        # TODO: Create folder with with bad path and see that you get a validation error.
        pass


class DatabaseWrapperClipTest(TestCase):

    def setUp(self) -> None:
        self.fid = create_root_folder(path="/home/user/", name="test_folder")
        self.cid = create_clip(fid=self.fid, name="test_clip", video_format="tvf",
                               start_time=timezone.now() - datetime.timedelta(hours=1),
                               end_time=timezone.now(), latitude=Decimal(value="13.37"),
                               longitude=Decimal(value="0.42"))

    def test_get_clip_by_id(self):
        c = get_clip_by_id(cid=self.cid)
        assert c.folder.id == self.fid
        assert c.name == "test_clip"
        assert c.video_format == "tvf"
        assert c.id == self.cid

    def test_get_clip_by_name(self):
        c = get_clip_by_name(fid=self.fid, name="test_clip", video_format="tvf")
        assert c.folder.id == self.fid
        assert c.name == "test_clip"
        assert c.video_format == "tvf"
        assert c.id == self.cid
        
    def test_get_not_existing_clip(self):
        assert get_clip_by_id(cid=2) is None
        assert get_clip_by_name(fid=self.fid, name="not_a_test_clip", video_format="tvf") is None

    def test_get_all_clips_from_folder(self):
        sid = create_subfolder(parent_fid=self.fid, name="test_subfolder")
        create_clip(fid=sid, name="new_test_clip", video_format="tvf",
                    start_time=timezone.now() - datetime.timedelta(hours=1),
                    end_time=timezone.now(), latitude=Decimal(value="42.0099"),
                    longitude=Decimal(value="0.1337"))
        assert len(get_all_clips_from_folder(fid=self.fid)) == 1
        assert len(get_all_clips_from_folder_recursive(fid=self.fid)) == 2

    def test_delete_clip(self):
        delete_clip(cid=self.cid)
        assert get_clip_by_id(cid=self.cid) is None
        assert get_clip_by_name(fid=self.fid, name="test_clip", video_format="tvf") is None

    def create_bad_clip(self):
        # TODO: Create clip with start time after end time and see that you get a validation error.
        pass


class DatabaseWrapperCameraTest(TestCase):

    def setUp(self) -> None:
        self.lat = Decimal(value="13.37")
        self.lon = Decimal(value="0.42")
        self.fid = create_root_folder(path="/home/user/", name="test_folder")
        self.cid = create_clip(fid=self.fid, name="test_clip", video_format="tvf",
                               start_time=timezone.now() - datetime.timedelta(hours=1),
                               end_time=timezone.now(), latitude=self.lat,
                               longitude=self.lon)

    def test_get_camera(self):
        pass

    def test_times_update_when_adding_clip(self):
        pass
