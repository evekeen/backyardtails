#!/bin/sh
pushd dist
zip ../backend.zip -r * -FS
zip ../backend.zip -r .ebextensions/*
popd