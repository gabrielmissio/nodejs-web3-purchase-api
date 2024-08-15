#!/bin/bash

# Check if at least the correct number of arguments is provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <appName> <region>"
    exit 1
fi

# Assign arguments to variables
appName=$1
region=$2
