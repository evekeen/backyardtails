#!/usr/bin/env bash
docker stop ll
docker rm -f ll
docker run -dit --name=ll -p 8081:8081 ivkin/love-letter:latest