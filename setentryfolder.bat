@echo off

IF [%1]==[] GOTO NO_ARG

python manage.py setentryfolder %1

GOTO END

:NO_ARG

echo No argument provided. Expected an absolute file path.

:END