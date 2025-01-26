#!/bin/bash

read -p "Enter the release tag (e.g., v0.17.0): " RELEASE_TAG

if [ -z "$RELEASE_TAG" ]; then
  echo "Release tag is required. Exiting."
  exit 1
fi

VERSION=$(echo "$RELEASE_TAG" | sed 's/^v//')

echo "Downloading kubeseal version $VERSION from release $RELEASE_TAG..."
wget "https://github.com/bitnami-labs/sealed-secrets/releases/download/$RELEASE_TAG/kubeseal-$VERSION-linux-amd64.tar.gz"

if [ $? -ne 0 ]; then
  echo "Failed to download kubeseal tarball. Exiting."
  exit 1
fi

echo "Extracting kubeseal-$VERSION-linux-amd64.tar.gz..."
tar -xvzf "kubeseal-$VERSION-linux-amd64.tar.gz" kubeseal

if [ $? -ne 0 ]; then
  echo "Failed to extract kubeseal. Exiting."
  exit 1
fi

echo "Installing kubeseal to /usr/local/bin..."
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

if [ $? -ne 0 ]; then
  echo "Failed to install kubeseal. Exiting."
  exit 1
fi

echo "Cleaning up downloaded files..."
rm -f "kubeseal-$VERSION-linux-amd64.tar.gz" kubeseal

echo "Verifying kubeseal installation..."
kubeseal --version

echo "Kubeseal installation completed successfully!"

