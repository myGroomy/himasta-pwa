#!/bin/bash
cd "$(dirname "$0")"
./node_modules/.bin/prisma generate 2>&1 | tail -8
