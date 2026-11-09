# S&OP and Inventory Optimization

Portfolio case study by Prapanch Kokkalemada.

| | Link |
|---|---|
| Tableau dashboard | [S&OP: Forecast, Safety Stock and OTIF](https://public.tableau.com/app/profile/prapanch.kokkalemada/viz/SOPandInventoryOptimization/SOPForecastSafetyStockandOTIFUSCensusRetailSales) |
| Notebook | [analysis/sop_forecast.ipynb](analysis/sop_forecast.ipynb) |
| Interactive model | [punch-k.github.io/Portfolio/sop-inventory-optimization](https://punch-k.github.io/Portfolio/sop-inventory-optimization/) |
| Tableau data | [tableau/](tableau/) |

**Tools:** Python (pandas, statsmodels, scipy), Tableau Public, JavaScript (Chart.js)

## Question

Which simple forecast method holds up best on real retail demand? How much safety stock does each one need? And what does each extra point of service cost in inventory?

## Data

U.S. Census Bureau, Monthly Retail Trade Survey, pulled from FRED on 2026-11-09.

- Retail sales, not seasonally adjusted, USD millions, Jan 2015 to Aug 2026, for 8 categories: MRTSSM4413USN, MRTSSM444USN, MRTSSM448USN, MRTSSM452USN, MRTSSM4451USN, MRTSSM446USN, MRTSSM442USN, MRTSSM451USN.
- Inventory to sales ratios, seasonally adjusted: MRTSIR441USS, MRTSIR444USS, MRTSIR448USS, MRTSIR452USS, MRTSIR445USS. Census does not publish a ratio for every category.

Recent months are advance estimates and can be revised.

## Steps

All steps run in [the notebook](analysis/sop_forecast.ipynb). Outputs are saved in it.

1. **Load and shape.** Read `data.csv` and pivot to one monthly series per category.
2. **Backtest.** Hold out the last 12 months. Forecast them in one go from the training data with three methods:
   - Naive: the last known month, repeated.
   - Seasonal naive: the same month last year.
   - ETS: Holt-Winters with a damped additive trend and multiplicative seasonality (statsmodels, parameters fitted on training data).
3. **Score.** MAPE, WAPE, bias and RMSE for each method and category.
4. **Forward plan.** Refit ETS on the full history and forecast 12 months. The 80% band uses the holdout RMSE.
5. **Safety stock ladder.** For service levels from 80% to 99.9%: safety stock = z × √(L × σ² + D² × σL²), using each method's RMSE as σ. Fill rate uses the normal loss function. OTIF = fill rate × supplier on-time rate.
6. **Export.** Write four CSVs to `tableau/` for the dashboard.

## Results

- ETS has the lowest holdout WAPE in 6 of 8 categories. Seasonal naive wins grocery and health and personal care. Naive never wins.
- For auto parts and tire stores, holdout WAPE is 3.1% (ETS), 3.6% (seasonal naive) and 5.2% (naive).
- At these settings, lead time variability drives most of the safety stock. A steadier supplier cuts more stock than a better forecast.
- Census inventory to sales ratios sit well above the modeled target. Real stores also hold slow movers, display stock and seasonal builds that this model leaves out.

## Assumptions

These are planning inputs, not data: 6 week lead time, 1 week lead time std dev, 2 week review period, 96% supplier on-time, 25% annual carrying cost. The interactive model lets you change all of them.

## Run it

```bash
pip install pandas numpy scipy statsmodels matplotlib jupyter
cd analysis
jupyter notebook sop_forecast.ipynb
```

The interactive page needs a local web server because it loads `data.csv` with `fetch`:

```bash
# from the Portfolio repo root
python -m http.server 8000
# open http://localhost:8000/sop-inventory-optimization/
```

## Files

| Path | What it is |
|---|---|
| `analysis/sop_forecast.ipynb` | Forecast backtest, safety stock and OTIF analysis |
| `tableau/*.csv` | Dashboard data written by the notebook |
| `tableau/BUILD.md` | How the Tableau dashboard is built, sheet by sheet |
| `data.csv` | Census data used by the notebook and the interactive page |
| `index.html`, `styles.css`, `app.js` | Interactive model |
