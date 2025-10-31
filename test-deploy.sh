#!/usr/bin/env bash
set -e

docker build -t projectmave:latest .
docker rm -f projectmave || true &&
docker run -d -p 127.0.0.1:8080:8080 \
  -v /opt/project/DataProtection-Keys:/root/.aspnet/DataProtection-Keys \
  --env-file ./.env \
  --name projectmave projectmave:latest



