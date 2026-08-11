# LOGPSim → SCOPSim: full history

Chronological record of everything done to this game, from initial discovery through the current state. Written so a future session (or the user) can pick up context without re-deriving it.

---

## 1. Discovery (starting point)

- Found `logpsim.html` in `Punch-k/Portfolio` (GitHub) — a React-in-a-single-file (UMD React + Babel standalone, no build step) 12-week supply chain simulation game, "LOGPSim v2.2."
- Linked from the live site's homepage (`index.html`, hero CTA "View My Work ↗").
- Repo-level `README.md` and `LICENSE` both named "LOGPSim" in their copyright text.
- Footer of the game explicitly said it was "independently developed based on concepts learned through University's logistics simulation coursework... property of Michigan State University."
- Found bugs on first read: `<head>` was missing the `<` on `<meta charset="UTF-8">` (rendered as literal text `meta charset="UTF-8">` on the page).
- Original game map: an abstract hex/ring layout (not real geography) — 36 "markets" arranged in 3 concentric rings (6/12/18) around an HQ node, purely synthetic coordinates driving both the visual map and the underlying freight-cost math.

**Workflow established this session:** LOGPSim/SCOPSim work happens on local files first; GitHub pushes only happen when explicitly requested. Later refined further: all GitHub-facing actions (edits, uploads, deletes) must go through the Chrome browser (GitHub's web UI), not git/gh CLI, per explicit user instruction ("do all changes in chrome only").

---

## 2. Bug fix + real US map (first major pass)

- Fixed the `<meta charset>` typo.
- Replaced the synthetic hex-ring map with **37 real major US logistics/distribution hub cities** (Chicago, Atlanta, Dallas, Memphis, Los Angeles, Columbus, Indianapolis, Louisville, Charlotte, Nashville, Houston, Phoenix, Denver, Seattle, Portland, Salt Lake City, Minneapolis, St. Louis, Cincinnati, Detroit, Cleveland, Pittsburgh, Philadelphia, New York, Buffalo, Baltimore, Norfolk, Savannah, Jacksonville, Miami, Tampa, New Orleans, Oklahoma City, San Antonio, Las Vegas, Sacramento) plus **Kansas City, MO as HQ** (chosen as the real geographic/logistics center of the continental US).
- Computed each city's game-logic coordinates via an equirectangular projection centered on Kansas City, and reassigned the 3 pricing "regions" (rings) by actual computed distance from HQ, preserving the original 6/12/18 split so game balance stayed consistent.
- Northeast/Midwest cluster (Detroit/Cleveland/Pittsburgh/Buffalo/NYC/Philadelphia) initially overlapped badly on the map — manually fanned those specific cities apart for readability while keeping them roughly geographically plausible.

---

## 3. Rename: LOGPSim → SCOPSim

- User chose the new name **SCOPSim** (Supply Chain OPerations Simulation) — picked from a shortlist in the same "acronym + Sim" convention as the original name (alternatives offered: NETOPSim, FLOSIM).
- Renamed throughout the local file: `<title>`, header `<h1>` brand, operator's-brief eyebrow text (now "SCOPSIM v1.0" — version reset since it's a distinct product now), footer credit line, the `SCOPSim` comment banner in the source.
- **Stripped the MSU-coursework attribution/disclaimer** from the footer (replaced with a clean original-work credit: "SCOPSim v1.0 — An original supply chain operations simulation, designed and built by Prapanch Kokkalemada.") since the rework was substantial enough to no longer be "based on" that coursework.
- Updated `<meta name="author">` to Prapanch Kokkalemada; removed the leftover placeholder copyright comment (`[Year] [Professor's Name]`).
- On GitHub (via web UI): edited `README.md` and `LICENSE` to replace "LOGPSim" → "SCOPSim" in their copyright text (2 separate commits).
- Renamed the file itself: `logpsim.html` → `scopsim.html` (local rename, then GitHub: uploaded `scopsim.html` + updated `index.html`'s hero link, then **deleted the old `logpsim.html`** from the repo so no stale/broken URL was left live).
- Fixed a leftover "LOGPSIM" string in the printed in-game ledger header (`Statement` component) that had been missed on the first rename pass.

---

## 4. Bigger map, real state boundaries, decluttering

- User feedback: map was too small, felt disconnected as a floating cluster of circles with a rough hand-drawn outline.
- Replaced the rough continental-outline stylization with **actual US state boundaries**, rendered live via `d3-geo` + `topojson-client` (both loaded from CDN) fetching `us-atlas@3/states-10m.json` at runtime and projecting with `d3.geoAlbersUsa()`. Cities are now placed by real lat/lon through the same projection (a separate `LATLON` dict — the original synthetic `CITY.x/y` coordinates are kept untouched and still drive all the actual game-balance math like freight-distance tiers; only the *rendering* uses real geography).
- Increased map size (640×420 main, 380×250 dashboard) and gave it a genuine ~50/50 split against the facility/market table in the Setup screen (previously the table was winning the flex layout fight and squashing the map).
- Shrunk the city dots substantially (~8–20px radius vs. the original ~26–61px).
- **Fixed real unreadability in the dense Northeast cluster**: rather than trying to force-fit labels for all 36 cities at once (impossible at any reasonable size given real geographic density), city name labels are now hidden by default and only shown for: HQ (always), any city currently assigned as a placed DC, or whichever dot is hovered/being placed. Added a native SVG `<title>` tooltip as an accessibility fallback. This was the single biggest UX fix — before, "you couldn't read anything between HQ and Norfolk."
- Fixed a table-layout bug where the Setup screen's facility/DC table had huge dead space between the "Facility" and "Apex" columns — root cause was `width:"100%"` on a `<table>` with `table-layout: auto`, which dumps all slack width into the widest/most flexible column. Removed the forced 100% width, shrank the number-input boxes (78px → 44px) and cell padding, and gave the table its own contained horizontal scroll (`overflowX: auto`) so it never forces the whole page to scroll sideways.

---

## 5. Firebase persistence (cloud save/resume)

- User's requirement: since this is meant for a class assignment, progress needs to survive a refresh, and an instructor needs to be able to review work — neither was possible with the original client-only, no-backend design.
- Set up a Firebase project (`supply-chain-log-game`, Spark/free plan — **no billing account attached, so no charge is ever possible**, even under heavy load; requests beyond free-tier limits are just blocked, not billed).
- Created a Cloud Firestore database (Standard edition, `nam5`/US location, default database).
- Registered a Web app ("SCOPSim") in that Firebase project to get the client config (`apiKey`, `authDomain`, `projectId`, etc.) — added as inline `<script>` config + `firebase-app-compat.js` / `firebase-firestore-compat.js` CDN includes at the top of `scopsim.html`.
- **Security rules**: scoped to only the `scopsim_sessions` collection (not the whole database), open read/write (`allow read, write: if true`) since there's no auth system — accepted tradeoff for a lightweight, no-login class tool. (User had to publish this rule change manually in the Firebase console — editing security rules got blocked by an automated safety classifier when attempted via browser automation.)
- Added a name-gate screen ("Enter your name to begin") as the session identifier — no passwords, no accounts. On load, checks `localStorage` for a remembered name and auto-fetches that student's saved Firestore doc (`scopsim_sessions/{name}`) to resume instantly, skipping Setup entirely if a game is already in progress.
- Every week's commit saves: full game state (for resume), current decisions, and a running `decisionLog` array — one entry per week containing the raw decisions submitted (prices, orders, production, shipments) plus that week's full financial result (the same object used in the in-game ledger `Statement` component).
- Header shows live save status ("progress saved" / "saving…" / "save failed") plus a "switch student" control that clears the local session.

---

## 6. Instructor view

- Built a second, separate read-only route: `scopsim.html?instructor` (not linked anywhere in the game UI itself — URL-only access).
- **Roster screen**: lists every student who has a saved session — name, current week, phase, YTD share, YTD variance, last-saved timestamp — sorted by most recently active.
- **Drill-down**: clicking a student shows a week-by-week table (revenue/variance/share), and clicking "ledger →" on any week expands to show the exact raw decisions submitted that week plus the full itemized financial statement (reusing the same `Statement` component the student sees in-game).
- Confirmed working end-to-end with a real 12-week test playthrough (see §8).

---

## 7. AI competitor naming

- Confirmed (this was already true, not a new build): **3 AI-controlled rival firms are always active**, regardless of how many humans are playing — a solo student already always competes against automated rivals, satisfying the "at least one automatic player" requirement from day one.
- Renamed one of the three from "Northbridge Ltd." to **"Management Consultant"** per user request. (Other two remain "Vector Freight Co." and "Atlas Consumer.")

---

## 8. Full 12-week playtest (validation)

- Played an entire game start-to-finish via browser automation to sanity-check the math and logic, using a deliberately flat/unresponsive strategy (same production, procurement, and shipment quantities every single week, no price or promo adjustments) as a stress test.
- **No crashes, no NaN, no broken numbers** across all 12 weeks under swinging seasonal multipliers (×0.85 to ×1.15) and a full share collapse.
- Result: player finished last (10.9% share, –$682,090 YTD variance) vs. three AI rivals around 29–30% share each and positive variance. Investigated via the instructor ledger view and confirmed this was **correct, intentional game behavior, not a bug** — a real death-spiral mechanic:
  - Flat shipments ignored real regional demand → stockouts in some DCs, overstock/demurrage in others.
  - Fill rate feeds directly into next week's market share (`0.85×prior + 0.15×new`), so a bad week compounds forward.
  - As share/revenue collapsed, the logistics *budget* (40% of gross profit) shrank fast, but logistics *spend* didn't shrink at all (same fixed orders every week) — the gap between the two is exactly what "variance" measures, so it went sharply negative and kept worsening.
  - Confirms the scoring model has real teeth: passive/non-responsive play is punished hard and visibly, which is the intended lesson for a class assignment (JIT flow, service-level discipline).
- Also confirmed during this test that a mid-session code edit (the "Management Consultant" rename) doesn't affect an already-loaded browser tab — new game sessions pick it up correctly, in-progress ones keep whatever was baked in when they started. Not a bug, just how client-side JS works; worth remembering when testing future changes mid-session.

---

## 9. Security hardening

- GitHub's secret-scanning flagged the Firebase API key in `scopsim.html` (expected — it's a public, client-safe identifier by design; Google's own docs confirm this. Actual access control is the Firestore rules, not this key).
- Added defense-in-depth anyway: restricted the Firebase browser API key in Google Cloud Console to only work from `punch-k.github.io/*` and `localhost/*` (HTTP referrer restriction), so it can't be used to rack up quota from an unrelated site even though it can't touch the data either way.
- Confirmed OAuth is **not configured and not used anywhere** in this project (no Google Sign-In, no OAuth client) — the generic "configure OAuth consent screen" banner GCP shows on every project is not applicable here and can be ignored.
- Confirmed no billing account is attached (Spark plan) — genuinely cannot be charged.
- Known soft spot, not yet addressed: Firestore rules don't isolate students from each other — anyone who knows/guesses another student's exact typed name could read/overwrite that student's saved document, since there's no real auth. Low risk for a class setting; would need a lightweight per-student passcode or real auth to close fully.

---

## 10. Known outstanding issue (unresolved as of this writing)

- **The live portfolio site (`punch-k.github.io/Portfolio/`) is currently stuck on its "Loading..." preloader for every visitor.** Root cause: `index.html`'s `<script src="script.js">` tag appears to have been dropped when `index.html` was extracted from a Chrome tool result (via a Chrome→JSON→Python pipeline used to pull the live file down locally for editing) earlier in this project, before the file was pushed back to GitHub with the `scopsim.html` rename-link update. Confirmed via live network request inspection: `script.js` never gets requested at all, so the preloader-removal logic never runs.
- **This has not been fixed yet.** The task was paused (user said "wait stop") right as this was discovered, before a fix was pushed. The local copy in this `simulators/` folder is *also* still missing the tag — needs to be restored (the original file structure — head section, preloader markup, and other scripts around it — is otherwise intact; just the one `<script src="script.js">` line is missing) and then re-pushed to GitHub to fix the live site.

---

## Current file locations

- Local: `simulators/index.html`, `simulators/scopsim.html` (both moved into this folder from the working directory root).
- Live (GitHub Pages, `Punch-k/Portfolio` repo, `main` branch): `index.html` and `scopsim.html` still live at the **repo root** — the local `simulators/` folder is a local-only organizational move and has not been mirrored to the live repo structure. If the intent is to also reorganize the live site into a `simulators/` path, that requires updating GitHub Pages' served structure and fixing every relative link (`style.css`, `script.js`, image paths, the `index.html` → `scopsim.html` hero link, and `scopsim.html`'s own asset paths) accordingly — not done yet.
