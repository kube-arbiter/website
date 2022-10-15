#!/bin/sh
docusaurus build

# copy images to the i18n docs folder
cp -r docs/img build/zh-Hans/docs/
