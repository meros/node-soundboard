#!/bin/sh
if [ -e "$1.stats" ]
then
    wc -l < "$1.stats"
else
    echo 0
fi
