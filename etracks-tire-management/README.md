# eTracks: The 80% Tire Gap

Portfolio case study: https://punch-k.github.io/Portfolio/etracks-tire-management-case.html
Tableau dashboard: https://public.tableau.com/app/profile/prapanch.kokkalemada/viz/eTracksTireManagementModel/eTracksTireManagementModelFlatvsBalancedvsStresshypotheticalfigures

Ontario raised its tire management target from 65% to 80% for 2026 onward and removed the $1 million penalty cap.
This model estimates how big the physical gap is, where the eTracks collection network loses tires month by month
(reach, seasonal backlog, grey market, processing), and which plan meets the target at what cost.

All model figures are hypothetical assumptions for illustration. Not affiliated with or endorsed by eTracks or RPRA.

## Files

| File | What it is |
|---|---|
| `eTracks_Supply_Chain_Model.xlsx` | The full model. Change the scenario on `Inputs!B4` (1 Flat, 2 Balanced, 3 Stress) or any blue input. |
| `tableau/etracks_tableau.csv` | Source for the Tableau dashboard. One row per scenario and month, Jan 2026 to Dec 2030. Annual target, shortfall and costs are spread evenly across months so sums are correct. |
| `tableau/etracks_monthly.csv` | 60-month flow per scenario: scrap generated, reached a site, grey market loss, hauled, managed, tires waiting. |
| `tableau/etracks_annual.csv` | Annual results per scenario: sites, reach, target, managed, attainment, shortfall, losses, costs and penalty. |

## How the monthly engine works

- Scrap generated = tires supplied x (1 - tread wear) x eTracks share, spread with a seasonal profile.
- Reach follows a diminishing-returns curve in the number of sites per region.
- When tires wait longer than 21 days, a growing share of new tires goes to private haulers.
- Hauling = base budget / 12, plus surge capacity in peak months.
- Processing = contracted capacity less outages. Processors refuse loads once their yard holds two months of stock.
