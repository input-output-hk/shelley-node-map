#!/bin/bash

if [ "$CI" != "true" ]; then
  echo ""
  echo "Can only use the publish script on CI"
  echo ""
  exit 1
fi

PACKAGE_VERSION=$(node ./scripts/getPackageVersion.js)
TAG_EXISTS=$(./scripts/tag_exists.sh v$PACKAGE_VERSION)
if [[ $TAG_EXISTS == "false" ]]; then
  echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > ./.npmrc
  npm publish --access public
fi
