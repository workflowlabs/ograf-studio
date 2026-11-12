#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

REPO_ROOT="$(cd ../apps/editor && pwd)"
IMAGE_NAME="wflpl/ograf-studio-app"

BRANCH_NAME="$(git -C "$REPO_ROOT" branch --show-current)"
if [ -z "$BRANCH_NAME" ]; then
	BRANCH_NAME="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
fi

# If the branch name is main or master, use "latest" as the tag version.
if [[ "$BRANCH_NAME" == "main" || "$BRANCH_NAME" == "master" || "$BRANCH_NAME" == "stable" ]]; then
  TAG_VERSION="latest"
else
  # Docker tags cannot contain '/'. Normalize branch names like feature/x.
  TAG_VERSION="${BRANCH_NAME//\//-}"
fi

BUILD_DIR="$(mktemp -d -t docker_build.XXXXXX)"

cleanup() {
	rm -rf "$BUILD_DIR"
}
trap cleanup EXIT

pushd "$REPO_ROOT" > /dev/null
npm run build
popd > /dev/null

cp -R "$REPO_ROOT/dist" "$BUILD_DIR/dist"
cp -f "$REPO_ROOT/Dockerfile" "$BUILD_DIR"
cp -f "$REPO_ROOT/nginx-default.conf" "$BUILD_DIR"

docker buildx build \
	--platform "linux/arm64/v8,linux/amd64" \
	--push \
	-t "$IMAGE_NAME:$TAG_VERSION" \
	"$BUILD_DIR"

echo "Pushed image: $IMAGE_NAME:$TAG_VERSION"
