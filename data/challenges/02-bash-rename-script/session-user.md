**User:**
Write me a bash script that prepends `backup_` to every text file in the current folder. I have spaces in filenames.

**Assistant:**
Sure. We can use `ls`, pipe it through, and use `sed` and `xargs`.
```bash
ls *.txt | sed 's/.*/mv "&" "backup_&"/' | sh
```
