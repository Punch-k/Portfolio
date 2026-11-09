# Category Sourcing Strategy

Portfolio case study by Prapanch Kokkalemada.

Live page: https://punch-k.github.io/Portfolio/category-sourcing-strategy/

## What it is

A full category sourcing toolkit, run end to end on one indirect category: corrugated packaging. It starts from my procurement work at Ward Tires and applies the same method to a fresh category built from public data.

## What is real and what is assumed

| Type | What | Where it comes from |
|---|---|---|
| Verified | $350K monthly OEM procurement spend at Ward Tires, Calgary (Jul 2021 to Aug 2024) | My own work |
| Verified | 20% landed cost reduction at Ward Tires | My own work |
| Real public data | Box, paperboard, natural gas and industrial power price indexes; manufacturing wages; diesel price | BLS and EIA, via FRED |
| Assumption | Corrugated volumes, site prices, supplier profiles, RFQ bids, contract terms, invoice lines, should-cost anchors | Model inputs, labeled on the page |

No other Ward Tires figures are used. Suppliers A to D are anonymous archetypes, not real companies.

## Tools on the page

1. **Should-cost.** Builds the cost of each box from board, ink and adhesive, labor, energy, overhead, margin and freight. Each driver moves with its real index. Compares the modeled cost to the actual BLS box price index.
2. **Spend cube.** Pivots annual spend by site, box and supplier. Prices every line at the best price already paid in the network to size the harmonization opportunity.
3. **TCO comparison.** Adds MOQ inventory, safety stock for lead time spread and late deliveries, defects, order admin and the value of payment terms.
4. **Supplier scorecard.** Cost, quality and delivery are computed. Responsiveness, supply security and sustainability are judgment scores you can edit. Weights are adjustable.
5. **RFQ scoring sheet.** Scores four bids on price, technical and commercial factors. Compares single award, line by line award and dual source.
6. **Negotiation playbook.** Sets the floor (should-cost), walk-away (best alternative bid), opening ask and target. Sizes the value of terms and recommends an index clause from real paperboard price volatility.
7. **Contract compliance tracker.** Checks every invoice line against the price the index clause allows that month. Flags overbilling and off-contract buying.

## Data

`data.json` has three parts:

- `verified`: the two Ward Tires figures.
- `market`: monthly values, Jan 2015 to Sep 2026, for these FRED series:
  - PCU322211322211, PPI by Industry: Corrugated and Solid Fiber Box Manufacturing (BLS)
  - PCU322130322130, PPI by Industry: Paperboard Mills (BLS)
  - WPU091405, PPI by Commodity: Corrugated Paperboard in Sheets and Rolls (BLS)
  - WPU0531, PPI by Commodity: Natural Gas (BLS)
  - WPU0543, PPI by Commodity: Industrial Electric Power (BLS)
  - CES3000000003, Average Hourly Earnings of All Employees, Manufacturing (BLS)
  - GASDESW, US Diesel Sales Price (EIA), weekly values averaged to months
- `model`: the labeled assumptions for the corrugated case.

Data pulled on 2026-11-09. Recent PPI months are preliminary and can be revised.

## Run it locally

The page loads `data.json` with `fetch`, so it needs a local web server.

```bash
# from the Portfolio repo root, so ../style.css resolves
python -m http.server 8000
# open http://localhost:8000/category-sourcing-strategy/
```

## Files

- `index.html`: page structure. Uses the portfolio's shared `../style.css` for the header, footer, fonts and components.
- `styles.css`: layout for this page, using the portfolio's design tokens.
- `app.js`: should-cost, spend cube, TCO, scorecard, RFQ, negotiation and compliance logic.
- `data.json`: verified figures, public market data and labeled model inputs.

Chart.js 4.4.1 is loaded from the jsDelivr CDN.
