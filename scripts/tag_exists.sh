#!/bin/bash

TAG_FOUND=$(git tag | grep "$1")
if [[ $TAG_FOUND == $1 ]]; then
  echo "true"
else
  echo "false"
fi
