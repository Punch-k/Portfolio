# Tableau build guide: S&OP and Inventory Optimization

One dashboard, five sheets. About 45 minutes in Tableau Public (desktop app or web authoring at public.tableau.com, Create > Web Authoring).

## Data

Four CSVs in this folder, all made by `../analysis/sop_forecast.ipynb`:

| File | One row is | Key fields |
|---|---|---|
| `sop_sales_forecast.csv` | one category, month and series | category, month, series (Actual, Naive, Seasonal naive, ETS, ETS forward), value (USD millions), phase, lower80, upper80 |
| `sop_accuracy.csv` | one category and method | category, method, MAPE, WAPE, Bias, RMSE, best |
| `sop_service_ladder.csv` | one category, method and service level | service_level, safety_stock, months_of_supply, fill_rate, otif, carrying_cost |
| `sop_inventory_ratio.csv` | one category and month | category, ratio_level, inv_sales_ratio (Census, months of sales) |

**Connect:** open `sop_sales_forecast.csv`. Drag the other three onto the canvas and relate each one to it on `category`.
Check the field types: `month` is a Date, `best` is a Boolean, and the ratios and amounts are Numbers.

## Colors

Use these hex codes. They match the portfolio site.

| Use | Hex |
|---|---|
| Dashboard background | `#0a0b0d` |
| Sheet background | `#0f1012` |
| Text | `#ede9e0` |
| Muted text, gridlines | `#787570` |
| Accent | `#c9a84c` |
| Actual | `#ede9e0` |
| ETS and ETS forward | `#c9a84c` |
| Seasonal naive | `#4a90e2` |
| Naive | `#787570` |
| Warning or Census line | `#e05a00` |

Format > Workbook: set the font to Georgia for titles and Tableau Book for everything else. Remove gridlines, or set them to `#787570` at 20%.

## Sheet 1: Forecast vs Actual

- Columns: `MONTH(month)`, continuous (green pill).
- Rows: `SUM(value)`.
- Color: `series`, using the colors above. Set `ETS forward` to a dashed line (Path > line pattern).
- Filters:
  - `category`: single value dropdown, show the filter, apply to all worksheets using related data sources.
  - `month`: from Jan 2023 onward.
- Band: drag `AVG(lower80)` and `AVG(upper80)` onto Rows, make them dual axis with `SUM(value)`, synchronize the axes, mark type Line, color `#c9a84c` at 40%, thin and dotted. Hide the extra axis headers.
- Title: `<category>: actual sales vs forecast (USD millions)`

## Sheet 2: Holdout accuracy

- Columns: `AVG(WAPE)`, format as percent with 1 decimal.
- Rows: `method`, sorted ascending by WAPE.
- Color: `best` (True `#c9a84c`, False `#787570`).
- Label: WAPE.
- Tooltip: MAPE, Bias and RMSE.
- Title: `Last 12 months, WAPE by method (lower is better)`

## Sheet 3: All categories

- Rows: `category`. Columns: `method`.
- Mark type: Square.
- Color: `AVG(WAPE)`, sequential from `#0f1012` to `#c9a84c`, reversed so low error is bright.
- Label: WAPE as a percent.
- Do not filter this sheet by category. On the category filter, untick this sheet in "Apply to worksheets".
- Title: `Which method wins where`

## Sheet 4: Inventory vs OTIF

- Columns: `AVG(months_of_supply)`. Rows: `AVG(otif)` as a percent.
- Detail: `service_level`. Color: `method`. Mark type: Line, with markers on.
- Reference line on Columns: `AVG(inv_sales_ratio)` from `sop_inventory_ratio`. Add a filter `month = latest` on that source first. Color `#e05a00`, dashed, label "Census inventory / sales".
- Tooltip: `Service <service_level>: OTIF <otif>, <months_of_supply> months, safety stock $<safety_stock>M`
- Title: `What each point of service costs`

Some categories have no Census ratio (furniture, health, sporting goods). The reference line just will not show for those.

## Sheet 5: KPI tiles

Make three small text sheets with big numbers (font size 28, `#c9a84c`):
- Best method WAPE: `MIN(WAPE)` from accuracy.
- Safety stock at 95%, ETS: filter ladder to `service_level = 0.95` and `method = ETS`, then `SUM(safety_stock)` formatted as `$#,##0"M"`.
- Census inventory / sales: latest `AVG(inv_sales_ratio)`.

## Dashboard

- Size: Automatic, or fixed 1200 × 900.
- Layout:
  - top row: title text box "S&OP and Inventory Optimization", a one-line subtitle ("US Census retail sales, Jan 2015 to Aug 2026. Portfolio case study."), then the three KPI tiles
  - middle: Sheet 1 (wide)
  - bottom row: Sheet 2, Sheet 4 and Sheet 3 side by side
- Put the category filter at the top right. Set it to apply to all related sheets except Sheet 3.
- Action: Dashboard > Actions > Filter. Source Sheet 3, target all, run on Select, field `category`. Clicking a cell in the heatmap then switches the whole dashboard.
- Add a small footer text box: "Data: U.S. Census Bureau, Monthly Retail Trade Survey, via FRED. Assumptions: 6 week lead time, 1 week std dev, 2 week review, 96% on-time, 25% carrying cost."

## Publish

1. File > Save to Tableau Public As: `S&OP and Inventory Optimization`.
2. On the viz page, check "Show viz on profile". Turn on "Allow access" if you want people to download it.
3. Copy the share link (the `public.tableau.com/views/...` URL) and send it to me. I will embed it on the case page.
