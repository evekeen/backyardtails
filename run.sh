#!/usr/bin/env bash
docker stop ivkin/love-letter
docker rm -f ivkin/love-letter
docker run -dit -p 8081:8081 \
 --mount type=volume,dst=/usr/loveletter/ui,volume-driver=local,volume-opt=type=none,volume-opt=o=bind,volume-opt=device=/Users/ivkin/llfront \
 ivkin/love-letter:latest