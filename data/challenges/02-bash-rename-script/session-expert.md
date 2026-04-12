**User:**
I need a bash script that prepends `backup_` to every `.txt` file in the current directory. Requirements:

- Must handle filenames with spaces, quotes, and non-ASCII characters correctly.
- **Do not parse `ls`.** I know about the "Parsing `ls` is evil" anti-pattern (`mywiki.wooledge.org/ParsingLs`).
- No `sed`/`awk` pipelines for the rename itself — I want a plain loop with native bash globbing.
- If there are no `.txt` files, the script should exit quietly, not fail with an error.
- Should be safe to re-run (idempotent-ish): don't double-prefix files that already start with `backup_`.

**Assistant:**
Great brief — those constraints rule out most of the classic pitfalls. Here is the script and then an explanation of each defensive piece:

```bash
#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob    # empty glob expands to nothing (not to the literal "*.txt")

for file in *.txt; do
    # Skip files that have already been processed
    [[ "$file" == backup_* ]] && continue

    mv -- "$file" "backup_$file"
done
```

Why each line matters:

- **`set -euo pipefail`** — fail loudly on the first error (`-e`), on an unset variable (`-u`), or on any failed stage of a pipeline (`-o pipefail`). Essential hygiene for any bash script that does filesystem work.
- **`shopt -s nullglob`** — without this, `*.txt` in an empty directory expands to the literal string `*.txt` and the loop tries to `mv '*.txt'`. With `nullglob`, the loop simply doesn't execute.
- **`for file in *.txt`** — native bash globbing. The shell does the expansion and gives us an array of real filenames, already split correctly on directory entries regardless of spaces or special characters. This is what makes the `ls`-parsing approach unnecessary.
- **Quoting `"$file"`** — critical. Without quotes, a filename like `my notes.txt` is re-split by word-splitting and becomes two arguments (`my` and `notes.txt`). Always quote variables that hold paths.
- **`--` before the filenames** — a portability guard: `mv` treats everything after `--` as a positional argument, so filenames that start with `-` (`-report.txt`) are not misread as flags.
- **`[[ "$file" == backup_* ]] && continue`** — the idempotency check. Re-running the script on the same directory is a no-op instead of producing `backup_backup_backup_notes.txt`.

**User:**
Why is `ls *.txt | sed ... | sh` bad? It looked clever and worked on my test files.

**Assistant:**
It appears to work — until the data shape changes. There are (at least) four distinct reasons it breaks:

1. **`ls` mangles filenames.** Depending on locale and version, it may add quoting, replace control characters with `?`, or colorize output with ANSI escape codes. You are not reading the real filenames; you are reading `ls`'s *presentation* of them.
2. **Word splitting.** Piping a filename like `my notes.txt` through `sed` and back into `sh` loses the boundary information. The shell on the receiving side re-splits on whitespace and suddenly `mv` sees three arguments, not two.
3. **Shell interpretation of special characters.** Filenames can contain `$`, backticks, quotes, newlines — all of which change meaning when re-interpreted by the downstream `sh`. This is not hypothetical; it is a well-known local privilege-escalation pattern.
4. **No error isolation.** If one `mv` fails in the middle of the stream, the rest of the pipeline keeps going. With a `for` loop and `set -e`, you stop at the first failure and know exactly which file broke.

The glob-and-loop pattern sidesteps every one of these: filenames never round-trip through a string representation, so there is no opportunity for information to be lost or reinterpreted.

**User:**
If I just wanted the smallest correct one-liner, without the hardening, what would it be?

**Assistant:**
The minimal native-bash version is:

```bash
for f in *.txt; do mv -- "$f" "backup_$f"; done
```

It still beats the `ls | sed | sh` version on every dimension that matters — spaces, quotes, leading dashes, non-ASCII — because the shell, not a string parser, does the file-name expansion. The hardened version above adds safety for scripts you check into a repo; the one-liner is fine for interactive use.
