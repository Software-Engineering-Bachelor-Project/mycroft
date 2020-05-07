from django.core.management.base import BaseCommand
from backend.file_manager import build_file_structure


class Command(BaseCommand):
    help = 'Sets entry folder to given file path.'

    def add_arguments(self, parser):
        parser.add_argument('folder', type=str, help='Path to entry folder')

    def handle(self, *args, **kwargs):
        folder = kwargs['folder']
        try:
            build_file_structure(file_path=folder)
            self.stdout.write("Successfully added entry folder.")
        except ValueError as e:
            self.stdout.write(str(e))
            self.stderr.write("Failed to add entry folder.")
