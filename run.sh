#!/bin/bash

NEXT_PORT=8080
if [ -n "$PORT" ]; then
    NEXT_PORT=$PORT
fi

yarn start -p $NEXT_PORT
