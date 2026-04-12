**User:**
Write me a bash script that prepends `backup_` to every text file in the current folder. I have spaces in filenames — don't use `ls` or pipes! I want a plain loop with native bash globbing.

**Assistant:**
Got it! Using `ls` inside loops is discouraged (the "Parsing ls" anti-pattern). This can be done much more cleanly with native Bash globbing. Here's a one-liner:
```bash
for file in *.txt; do mv "$file" "backup_$file"; done
```
