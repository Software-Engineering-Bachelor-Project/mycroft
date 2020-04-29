#!/bin/bash

if [ "$#" -ge 1 ]; then
  python manage.py setentryfolder $1
else
  echo No argument provided. Expected an absolute file path.
fi
