from django.test import TestCase

# Import module
from backend.project_manager import *


class GetProjectsTest(TestCase):

    def test_multiple_projects(self):
        """
        Test getting multiple projects.
        """
        create_project('project1')
        create_project('project2')
        create_project('project3')
        code, res = get_projects()
        self.assertEqual(200, code)
        self.assertEqual(len(res), 3)

    def test_no_projects(self):
        """
        Test getting projects when there are none.
        """
        code, res = get_projects()
        self.assertEqual(code, 200)
        self.assertEqual(res, [])


class NewProjectTest(TestCase):

    def test_basic(self):
        """
        Makes a simple call.
        """
        code, res = new_project(data={PROJECT_NAME: 'test_project'})
        self.assertEqual(code, 200)
        self.assertEqual(res, {PROJECT_ID: 1})
        self.assertEqual(Project.objects.count(), 1)
        self.assertEqual(Filter.objects.count(), 1)


class DeleteProjectTest(TestCase):

    def setUp(self) -> None:
        self.pid = create_project(name='test_project')

    def test_basic(self):
        """
        Makes a simple call.
        """
        code, res = delete_project(data={PROJECT_ID: self.pid})
        self.assertEqual(code, 200)
        self.assertEqual(res, {})
        self.assertEqual(Project.objects.count(), 0)


class RenameProjectTest(TestCase):

    def setUp(self) -> None:
        self.pid = create_project(name='test_project')

    def test_basic(self):
        """
        Makes a simple call.
        """
        code, res = rename_project(data={PROJECT_ID: self.pid, PROJECT_NAME: 'new_name'})
        self.assertEqual(code, 200)
        self.assertEqual(get_project_by_id(pid=self.pid).name, 'new_name')
