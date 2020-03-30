#! /bin/bash

echo "Remove old directory"
rm -rf ./release
mkdir ./release

echo "Copy files and folder"
cp ./*.html ./release
cp -R ./css ./release
cp -R ./images ./release
cp -R ./js ./release
cp -R ./styles ./release

rm ./release/js/vis/*.map
