#!/usr/bin/env bash
docker stop ll
docker rm -f ll

rm -rf ~/llfront
mkdir ~/llfront

docker run -dit --name=ll -p 8081:8081 \
  --mount type=volume,dst=/usr/loveletter/ui,volume-driver=local,volume-opt=type=none,volume-opt=o=bind,volume-opt=device=/Users/ivkin/llfront \
 ivkin/love-letter:latest