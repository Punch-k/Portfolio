# CRM and RevOps Dashboard

Portfolio case study by Prapanch Kokkalemada.

Live page: https://punch-k.github.io/Portfolio/crm-revops-dashboard/

## What it is

A front-end demo of the weekly reporting a revenue team runs. It shows the workflow and the math. It is not a live CRM connection and does not claim one.

## Illustrative demo portfolio

The 300 accounts in `data.json` are synthetic. A script generated them with a fixed random seed (20261109), so the demo is the same every time. Account names come from word lists. Any match with a real company is a coincidence. Reps are labeled Rep A to Rep H. This is not a real client list.

## Views

1. **Pipeline by stage.** Open and weighted pipeline by stage and deal type. Stage probabilities are editable. Flags slipped deals (past close date) and stale deals (older than a limit you set). Shows weighted close by quarter.
2. **Account health.** A score from 0 to 100 built from six signals: seat usage, usage trend, NPS, support load, executive sponsor and days since last touch. Weights and band thresholds are editable. Shows the distribution, ARR vs health, and a ranked at-risk list.
3. **Renewal forecast.** Applies churn and downsell rates by health band to every renewal in the next 12 months. Adds weighted expansion and cross-sell pipeline. Reports GRR and NRR and draws the ARR bridge.
4. **QBR view.** One account on one page: health drivers, six month usage trend, open deals and a drafted QBR agenda (wins, risks, asks).
5. **Territory and quota model.** Quota is book ARR times a growth target. Coverage compares weighted pipeline to quota. A rebalance option moves accounts until books are even and shows the before and after.

## Assumptions

Stage probabilities, health weights, band thresholds, churn and downsell rates, save rate, growth target and coverage ratio are all model inputs. You can change them on the page.

## Data

`data.json` holds:

- `meta`: as-of date (2026-11-09), seed and label.
- `territories`, `reps`, `stages`.
- `accounts`: 300 records with segment, industry, territory, ARR, start and renewal dates, seats, usage, six month usage trend, NPS, support tickets, severity 1 tickets, executive sponsor flag, days since last touch and open opportunities.

## Run it locally

The page loads `data.json` with `fetch`, so it needs a local web server.

```bash
# from the Portfolio repo root, so ../style.css resolves
python -m http.server 8000
# open http://localhost:8000/crm-revops-dashboard/
```

## Files

- `index.html`: page structure. Uses the portfolio's shared `../style.css` for the header, footer, fonts and components.
- `styles.css`: layout for this page, using the portfolio's design tokens.
- `app.js`: pipeline, health, renewal, QBR and territory logic.
- `data.json`: the illustrative demo portfolio.

Chart.js 4.4.1 is loaded from the jsDelivr CDN.
