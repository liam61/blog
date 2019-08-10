#!/bin/sh
/snap/bin/docker-compose stop
/snap/bin/docker-compose rm -f
/snap/bin/docker-compose up -d
/snap/bin/docker ps
