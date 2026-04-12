**User:**
Write me a bash script that prepends `backup_` to every text file in the current folder. I have spaces in filenames.

**Assistant:**
Sure. We can build a one-liner with `ls`, a regex substitution via `sed`, and pipe the result into `sh`:

```bash
ls *.txt | sed 's/.*/mv "&" "backup_&"/' | sh
```

This takes every `.txt` file, wraps its name in `mv "old" "backup_old"`, and executes the result. Short and clever!

**User:**
It worked for simple filenames but broke on ones with spaces — I ended up with files like `backup_my`, `backup_notes.txt` instead of `backup_my notes.txt`. What happened?
