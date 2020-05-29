#!/usr/bin/env bash
docker pull ivkin/backyard-tails
docker stop ll
docker rm -f ll

rm -rf /home/ubuntu/llfront
mkdir /home/ubuntu/llfront

docker run -dit --name=ll -p 8081:8081 \
 --mount type=volume,dst=/usr/loveletter/ui,volume-driver=local,volume-opt=type=none,volume-opt=o=bind,volume-opt=device=/home/ui \
 ivkin/backyard-tails:latest

