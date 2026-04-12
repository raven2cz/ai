#!/bin/bash
# Failed attempt — breaks on spaces, quotes, and special characters.
# Parses ls, which is the "Parsing ls is evil" anti-pattern.
ls *.txt | sed 's/.*/mv "&" "backup_&"/' | sh
