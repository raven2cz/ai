# Claude Code Session Archives

Zipped snapshots of past Claude Code conversations for this repo. Each
archive captures the full session transcript plus any sub-agent
transcripts and cached tool results, so a future Claude Code run can
resume with complete context.

## Archive layout

Each `session-<date>-<short-id>.zip` contains:

```
<session-id>.jsonl                # primary conversation transcript (JSONL, one event per line)
<session-id>/
  subagents/                      # transcripts from Agent-tool sub-invocations
  tool-results/                   # cached large tool results referenced by the transcript
META.txt                          # session id, date range, branch, HEAD commit at archive time
```

These are exactly the files Claude Code writes under
`~/.claude/projects/<project-slug>/` while the session runs.

## How to restore a session

Claude Code discovers past sessions by scanning
`~/.claude/projects/<project-slug>/` for `<session-id>.jsonl` files
(plus the matching `<session-id>/` directory). To bring an archived
session back:

1. Identify your project slug. For this repo it is
   `-home-box-git-github-ai` (Claude Code replaces `/` with `-` in the
   absolute repo path). Confirm with:

   ```bash
   ls ~/.claude/projects/ | grep ai
   ```

2. Unzip the archive directly into that project directory:

   ```bash
   cd ~/.claude/projects/-home-box-git-github-ai/
   unzip /path/to/repo/plans/sessions/session-YYYY-MM-DD-xxxxxxxx.zip
   ```

   The archive root contains `<session-id>.jsonl` and
   `<session-id>/`, which land next to any current sessions without
   overwriting them.

3. Launch Claude Code from the repo root and resume with either:

   - `claude --resume` — interactive picker listing recent sessions
     (archived session now appears).
   - `claude --resume <session-id>` — jump straight to the restored
     session by its UUID.

4. If you want to inspect a session *without* restoring it, you can
   read the `.jsonl` directly — each line is a JSON event
   (`user`, `assistant`, `tool_use`, `tool_result`, …). Useful one-liner
   to skim prompts:

   ```bash
   jq -r 'select(.type=="user") | .message.content[]? | select(.type=="text") | .text' <session-id>.jsonl
   ```

## Notes

- Transcripts may reference absolute paths from the machine where the
  session was recorded. Restoring into the same repo on the same user
  keeps those references valid.
- Sub-agent transcripts under `subagents/` and bulky cached tool
  outputs under `tool-results/` are required for the main transcript
  to render correctly after restore — keep them in the archive.
- Session files can contain snippets of source code and shell output
  from the repo; treat them as you would any other repo content.
