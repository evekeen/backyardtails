#!/bin/sh
pushd backend
#npm ci
npm run build-prod
popd
pushd ui
#npm ci
npm run build
popd