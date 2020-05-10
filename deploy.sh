#!/usr/bin/env bash
./build.sh

unset DOCKER_HOST
unset DOCKER_TLS_VERIFY
unset DOCKER_TLS_PATH

docker build -t ivkin/love-letter docker
docker tag ivkin/love-letter ivkin/love-letter
docker push ivkin/love-letter