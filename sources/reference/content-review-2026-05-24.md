---
title: "Site content review — May 24, 2026"
source: "Internal content audit"
url: "self"
fetched: "2026-05-24"
---

# Content review findings

Independent agent review of every section of `index.html` against the live model data (`assets/montecarlo-results.json`) and the source corpus. Goal: find stale numbers, inconsistencies, and missing content.

## Stale numbers caught and fixed

- BLUF / verdict-box contradictions: front page had "Holds ≈ 66%" (BLUF) and "≈ 69%" (verdict box) on the same screen.
- "Median Mon ~5 am" vs "Mon ~4 am" same-page inconsistency.
- Monte Carlo section claimed "300,000 simulations" — actual is 10,000 ABC trajectories.
- Chart caption said "deluge holds ~67%" — actual 66.2%.
- Footer said "Monte Carlo (n=300k)".
- `data.js` fallback `monteCarlo` block still held pre-fouling 78%/22% distribution.

## Missing sections / content (added)

- **"What this is NOT" scope statement** — added before BLUF.
- **"What changed recently" panel** — git-log-driven changelog under BLUF.
- **Sensitivity section** with tornado chart from `assets/sensitivity.json`.
- **Audit summary callout** linking to `sources/reference/model-audit-2026-05-24.md`.
- **O₂-MEHQ cliff equation** in the model code block.
- **Diurnal clock-aligned solar term** documented.
- **Reproduce** section explaining `scripts/montecarlo.js`, `scripts/sensitivity.js`, and `scripts/refresh.sh`.

## Inconsistencies between prose and model

- Hypothesis section (§7) still framed "Sunday afternoon" as the dominant window — that was the first-pass synthesis; the calibrated MC now puts Sat night → Sun 6 am at 6.4% (largest single bin) and Sun afternoon at 3.3%. Reframed prose accordingly.
- Timeline row at h=72 labeled "Primary peak-danger window" — current MC distribution disagrees. Re-labeled.

## Open recommendations

- Add Vietnamese/Spanish BLUF translation (Little Saigon in evacuation zone).
- Add source-license footer (mixed CC-BY-SA and AP wire content).
- Reconcile TOC anchor names with section display names.
