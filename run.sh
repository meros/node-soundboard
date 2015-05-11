#!/bin/bash

cd www && bower install
cd ../node && npm install && node soundboard.js	 