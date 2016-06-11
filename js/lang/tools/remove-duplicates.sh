#!/bin/sh
jslint --maxerr=9000 dict.js | awk -f remove-duplicates.awk - dict.js
