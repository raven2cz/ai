#!/bin/bash
ls *.txt | sed 's/.*/mv "&" "backup_&"/' | sh
