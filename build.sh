#!/bin/bash

dir=$(dirname $0)
branch=$(git --git-dir=$dir/.git rev-parse --abbrev-ref HEAD)
version=${1:-$branch}

r.js -o buildconfig.js

tar -c -z -f $dir/aceeditor-$version.tar.gz -C $dir/.. \
    aceeditor/{conf,images,lang} \
    aceeditor/{action.php,build.js,NEWS,plugin.info.txt,preview.php,README,style.css}
