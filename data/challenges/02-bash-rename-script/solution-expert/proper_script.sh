#!/bin/bash
for f in *.txt; do 
    mv "$f" "backup_$f"
done
