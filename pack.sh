#!/bin/bash

if [ "$#" -ge 1 ]; then
  npm run --prefix frontend $1
else
  echo No argument provided. Expected \"dev\" or \"build\".
fi
