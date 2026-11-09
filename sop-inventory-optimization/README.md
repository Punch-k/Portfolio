# S&OP and Inventory Optimization

Portfolio case study by Prapanch Kokkalemada.

Live page: https://punch-k.github.io/Portfolio/sop-inventory-optimization/

## What it does

A working S&OP model on real US retail sales data. It runs in the browser. There is no backend.

1. **Demand review.** Backtests three forecast methods on a holdout window you choose:
   - Naive: repeats the last known month.
   - Seasonal naive: repeats the same month last year.
   - ETS: Holt-Winters exponential smoothing with a damped trend. Weights are fitted by grid search on the training months, or set by hand.
   Shows MAPE, WAPE, bias and RMSE per method. Runs the same test across all 8 categories.
2. **Safety stock.** Sets the buffer from service level, lead time, lead time variability and review period. Demand uncertainty comes from the forecast error of the chosen method, or from raw demand swings for comparison.
3. **Inventory vs OTIF.** Plots modeled OTIF against months of supply for service levels from 80 to 99.9 percent. In-full uses the normal loss function. On-time uses a supplier on-time rate you set. The Census inventory to sales ratio is shown on the same axis where Census publishes one.
4. **Supply review.** Projects 12 months of demand, receipts and ending inventory. It applies consensus overrides and a receiving cap, and flags months below safety stock.
5. **S&OP memo.** Writes a one-page memo (decision, risk, what to change next cycle) from the numbers above.

## Data

`data.csv` holds every number the page uses. Columns: `month, naics, category, metric, value, unit, fred_series, ratio_level`.

- Retail sales, not seasonally adjusted, USD millions. U.S. Census Bureau, Monthly Retail Trade Survey. Retrieved from FRED (Federal Reserve Bank of St. Louis). Series: MRTSSM4413USN, MRTSSM444USN, MRTSSM448USN, MRTSSM452USN, MRTSSM4451USN, MRTSSM446USN, MRTSSM442USN, MRTSSM451USN. Jan 2015 to Aug 2026.
- Inventories to sales ratios, seasonally adjusted. Same survey. Series: MRTSIR441USS, MRTSIR444USS, MRTSIR448USS, MRTSIR452USS, MRTSIR445USS. Census does not publish a ratio for every category. Where the ratio is published only at a parent level (for example 441 for auto parts and tire stores, 445 for grocery), the page says which level it uses.

Data pulled on 2026-11-09. Recent months are Census advance or preliminary estimates and can be revised.

## Assumptions

Policy inputs are planning choices, not data: service level, lead time, lead time variability, review period, supplier on-time rate, carrying cost rate, consensus overrides and receiving cap. All of them can be changed on the page. Inventory is valued at retail sales dollars because Census sales are reported that way.

## Run it locally

The page loads `data.csv` with `fetch`, so it needs a local web server. Opening the file directly will not work.

```bash
# from the Portfolio repo root, so ../style.css resolves
python -m http.server 8000
# open http://localhost:8000/sop-inventory-optimization/
```

## Files

- `index.html`: page structure. Uses the portfolio's shared `../style.css` for the header, footer, fonts and components.
- `styles.css`: layout for this page. Uses the same design tokens as the portfolio.
- `app.js`: forecasting, safety stock, OTIF, supply projection and memo logic.
- `data.csv`: Census data used by every chart and table.

Chart.js 4.4.1 is loaded from the jsDelivr CDN.
