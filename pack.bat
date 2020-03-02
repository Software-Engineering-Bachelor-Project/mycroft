@echo off

IF [%1]==[] GOTO NO_ARG

npm run --prefix frontend %1

GOTO END

:NO_ARG

echo No argument provided. Expected "dev" or "build".

:END