# Project Documentation Log (MANDATORY)

This repo keeps three living documents at its root: `README.md`, `BugFixes.md`, and `History.md`. Create any that are missing the first time they are needed.

## Before fixing anything — read first
Before starting ANY bug fix, regression chase, or behavioural change, read `BugFixes.md` and `History.md` (and the relevant part of `README.md`) end to end, to:
- Confirm the fix is not a duplicate of one already applied.
- Confirm the change does not re-introduce a bug that was previously fixed, or undo a deliberate decision recorded there.

If a prior entry covers the same symptom, say so and build on that entry instead of writing a second, conflicting fix. If the earlier fix regressed, note that explicitly in the new entry and reference the old one by date and title.

## After a change lands — write it up
When a major change or feature lands (new feature, integration, breaking change, config/auth change, non-trivial bug fix), update the docs as part of the same change set, never as a follow-up:
- `README.md` — keep setup, configuration, architecture, and usage accurate.
- `BugFixes.md` — one entry per bug fixed.
- `History.md` — one entry per feature, integration, or notable decision.

## Entry format (newest first, absolute dates)
```markdown
## YYYY-MM-DD — Short title naming the thing and the symptom

**Issue:** What was actually broken or missing, in plain terms, including the
user-visible effect.

**Fix:** What changed, and what deliberately did NOT change — scope boundaries
and anything left for a later version.
```

Rules for entries:
- Absolute dates (`2026-09-01`), never "yesterday" or "last sprint".
- Newest entry at the top of the file.
- State what was verified, not what was intended. If something is unverified or is a workaround, say so in the entry.
- Never put secrets, tokens, connection strings, or Connect/webhook URLs in these files — describe them by name and where they live (e.g. "stored in `.env` as `ZOHO_CONNECT_URL`; treat like a password").

Example:

```markdown
## 2026-09-01 — Zoho Projects had no tools until live tools/list

**Issue:** The connector was connected but the catalogue was empty, so agents
could not call Zoho.

**Fix:** Catalogue the 74 official read names from a live `tools/list`. Do not
invent community names. Writes stay out of v1.
```
