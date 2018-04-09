#! /bin/bash

TARGETS="alpine-x64 linux-x64 linux-x86 mac-x64"
for i in $TARGETS; do
  npx nexe -t $i"-8.9.4" --resource ./jsonschema ./index.js -o "./build/rhome-"$TRAVIS_TAG"-"$i
done

WIN_TARGETS="windows-x64 windows-x86"
for i in $WIN_TARGETS; do
  npx nexe -t $i"-8.9.4" --resource ./jsonschema ./index.js -o "./build/rhome-"$TRAVIS_TAG"-"$i".exe"
done
