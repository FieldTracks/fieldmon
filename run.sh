#!/bin/bash
trap ctrl_c INT

function ctrl_c() {
    echo "Stopping container..."
    docker stop $(docker ps | grep fieldmon | cut -d " " -f 1)
    exit 0
}


docker build -t fieldmon .
echo "Starting container..."
docker run --volume $(pwd):/app -e PATH="$PATH" -p "127.0.0.1:4200:4200" fieldmon &

while true; do
    sleep 600
done
