# Diamond Touch AI OS — Agent Instructions

You are working inside the Diamond Touch AI OS repository, built for Doric Sithole of Blue Diamond Communications (Johannesburg). This is her operational intelligence system — not a demo. Every file in `Systems/` is live business data.

**Engine:** SANKOFA (v1.1.0) — named for the Akan bird: learning from the past to move forward.

---

## Before Acting on Any Request

Ask: **Does this system already handle this?**

1. Is there a guardian for this? → `SANKOFA-ENGINE/guardians/`
2. Is there a prompt for this mode? → `SANKOFA-ENGINE/guardians/[name]/prompts/`
3. Is there a state record for this? → `Systems/STATE/`

If none exist, build into the right layer — not inline, not in a scratch file.

---

## What Lives Where

| Folder | Purpose |
|---|---|
| `SANKOFA-ENGINE/` | The AI engine — guardians, watcher, learning loop, connectors |
| `Systems/STATE/` | Living state: `sankofa-state.md` (clients, pipeline, tasks) + `MEMORY.md` |
| `Systems/TRAINING/` | Training programme files — triggers OYA guardian |
| `Systems/COACHING/` | Coaching session files — triggers MAWU guardian |
| `Systems/CONTENT/` | LinkedIn + social content files — triggers NOMMO + ELEGBA |
| `Systems/PIPELINE/` | Pipeline tracking files — triggers ESHU guardian |
| `Systems/PROPOSALS/` | Proposal and research files — triggers ANANSI guardian |
| `Systems/FINANCE/` | Financial tracking files — triggers YEMOJA guardian |
| `Systems/SPEAKERS/` | Speaker booking + event files — triggers ANANSI + ESHU + NOMMO |

---

## The 7 Guardians

| Guardian | Deity | Owns |
|---|---|---|
| NOMMO | Dogon (divine word) | Content voice — REVIEW, AUDIT |
| OYA | Yoruba (transformation) | Training delivery — ASSESS, CONTENT, REPORT |
| MAWU | Fon/Ewe (wisdom) | Coaching lifecycle — SESSION, PROGRESS, ONBOARD, CONCLUSION |
| ESHU | Yoruba (crossroads) | Pipeline + intake routing — PIPELINE, INTAKE |
| ANANSI | Akan (spider/story) | Proposals + research — PROPOSAL, RESEARCH |
| YEMOJA | Yoruba (water/life) | Finance tracking — TRACK, DATABASE |
| ELEGBA | Yoruba (messenger) | Channel execution — REVIEW, SCHEDULE |

The engine routes automatically by file path. You do not call guardians manually — drop files in the right `Systems/` folder and the watcher triggers them.

---

## AI Provider — Auto-Detection

The engine works with either OpenAI or Anthropic. Set ONE key in `SANKOFA-ENGINE/.env`:

```
OPENAI_API_KEY=sk-...        # ChatGPT / OpenAI
# or
ANTHROPIC_API_KEY=sk-ant-... # Claude / Anthropic
```

The engine reads which key is present and loads the right SDK automatically. No code change needed when switching providers.

Model defaults per provider:
- **OpenAI:** standard = `gpt-4o-mini`, upgrade = `gpt-4o`
- **Anthropic:** standard = `claude-haiku-4-5-20251001`, upgrade = `claude-sonnet-4-6`

ANANSI uses the upgrade model for RESEARCH mode. All others use standard.

---

## Running the Engine

```bash
cd SANKOFA-ENGINE
npm install
node index.js
```

The engine starts, watches `Systems/`, and routes any new or modified `.md` files to the appropriate guardian. Guardian logs appear in `Systems/STATE/sessions/guardian-logs/`.

---

## State Files — Read These First Every Session

Before making any changes, read:
1. `Systems/STATE/sankofa-state.md` — current clients, pipeline, tasks, flags
2. `Systems/STATE/MEMORY.md` — Doric's profile and system context

These are the source of truth. Do not rely on conversation history for client or pipeline data.

---

## Session Close Protocol

Before ending any session that produced meaningful output:

1. Update `Systems/STATE/sankofa-state.md` — clients, pipeline, open tasks, flags
2. Commit all changed `Systems/` files: `git commit -m "close: YYYY-MM-DD — [summary]"`
3. Push to remote

A session that ends without updating `sankofa-state.md` is incomplete.

---

## Build Rules

- Guardian prompts live in `SANKOFA-ENGINE/guardians/[name]/prompts/` — `base.md` always loads; `MODE.md` overlays per routing signal
- New guardian modes: add `MODE.md` to the prompts folder + add the signal to `watcher.js`
- New guardians: follow the pattern in any existing guardian index.js — extend `GuardianBase`, declare `detectMode()` and `resolveModel()`
- Never hardcode client data inside engine files — data belongs in `Systems/`, engine reads it
- Never commit `.env` — credentials stay local

---

## Timezone

UTC+2 (Africa/Johannesburg). All times displayed in UTC+2.
