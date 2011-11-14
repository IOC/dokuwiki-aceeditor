#!/bin/bash

dir=$(dirname $0)
branch=$(git --git-dir=$dir/.git rev-parse --abbrev-ref HEAD)
version=${1:-$branch}

rm -rf $dir/build
coffee -c $dir/scripts/*.coffee

r.js -o name=main out=$dir/build/main.js baseUrl=$dir/scripts \
    paths.requirejs=require include=requirejs \
    paths.ace=../ace/lib/ace \
    paths.ace/requirejs/text=text \
    name=main
r.js -o baseUrl=. appDir=$dir/scripts/ace/theme dir=$dir/build/ace/theme
rm -f $dir/build/ace/theme/build.txt

tar -c -z -f $dir/aceeditor-$version.tar.gz -C $dir/.. \
    aceeditor/{build,conf,images,lang} \
    aceeditor/{action.php,NEWS,plugin.info.txt,preview.php,README,style.css}
