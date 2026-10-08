#!/bin/sh
aplay "$1"
date -R >> "$1.stats"
