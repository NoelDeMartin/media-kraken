#!/usr/bin/env sh

# abort on errors
set -e

# compile uml images
cat docs/classes.uml | docker run --rm -i think/plantuml -tjpg > docs/Classes.jpg
