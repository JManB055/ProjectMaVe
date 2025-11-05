#!/usr/bin/env bash
set -e

docker build -t projectmave:latest .
docker save projectmave:latest | gzip > projectmave.tar.gz
scp projectmave.tar.gz aseda@yhrcl.org:/opt/mave/
ssh aseda@yhrcl.org '
  cd /opt/mave &&
  gunzip -c projectmave.tar.gz | docker load &&
  docker rm -f projectmave || true &&
  docker run -d -p 127.0.0.1:5000:8080 \
    -v /opt/project/DataProtection-Keys:/root/.aspnet/DataProtection-Keys \
    --env-file /opt/mave/.env \
    --name projectmave projectmave:latest
'



