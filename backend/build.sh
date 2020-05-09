#!/bin/sh
pushd dist
zip ../backend.zip -r * -FS
popd
zip ./backend.zip -r .ebextensions/*