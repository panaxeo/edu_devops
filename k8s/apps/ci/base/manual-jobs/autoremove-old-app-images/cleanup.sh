#!/bin/sh
set -e

dockerd &
sleep 10

AUTH=$(jq -r '.auths["https://index.docker.io/v1/"].auth' /kaniko/.docker/config.json)
USERNAME=$(echo $AUTH | base64 -d | cut -d ':' -f 1)
PASSWORD=$(echo $AUTH | base64 -d | cut -d ':' -f 2)

TOKEN=$(curl -m 20 -s -H "Content-Type: application/json" -X POST -d '{"username":"'$USERNAME'", "password":"'$PASSWORD'"}' "https://hub.docker.com/v2/users/login/" | jq -r .token)

for REPO in "backend" "frontend"; do
  echo "Checking images for repo: $REPO"
  images=$(curl -m 20 -H "Authorization: JWT ${TOKEN}" "https://hub.docker.com/v2/repositories/pnxedudevops/apps/tags/" | jq -r '.results | map(.name) | .[]' | grep -E "${REPO}-[0-9a-fA-F-]{40}")

  if [ -n "$images" ]; then
    echo "Deleting the following images for repo $REPO: $images"
    
    for image in $images; do
      echo "Deleting image: $image"
      curl -s -H "Authorization: JWT ${TOKEN}" -X DELETE \
      "https://hub.docker.com/v2/repositories/pnxedudevops/apps/tags/$image/"
    done
  else
    echo "No images found to delete for repo $REPO."
  fi
done
