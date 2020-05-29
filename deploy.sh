#!/usr/bin/env bash
./build.sh

unset DOCKER_HOST
unset DOCKER_TLS_VERIFY
unset DOCKER_TLS_PATH

docker build -t ivkin/backyard-tails docker
docker tag ivkin/backyard-tails ivkin/backyard-tails
docker push ivkin/backyard-tails