```
# EpidemiWatch – Judging Checklist (72h Edition)

Use this to track exactly what the judges will evaluate. Do not add features unless everything here is ✅.

---

## ✅ Completeness & Feasibility (5 pts)

- [ ] Quarkus backend running locally (or on OpenShift)
- [ ] POST /api/reports works and stores data
- [ ] GET /api/alerts returns alerts
- [ ] POST /api/detect generates alerts from mock data
- [ ] React dashboard displays alerts list
- [ ] Map shows Kenya (even static) with severity colors
- [ ] IBM Bob usage clearly demonstrated (screenshot or video)
- [ ] README includes setup instructions

## ✅ Creativity & Innovation (5 pts)

- [ ] Use of z‑score / deviation from baseline (not just case count)
- [ ] "Public Health Threat Intelligence" language in README/demo
- [ ] Watson summarization (mock or real) adds AI layer
- [ ] Specifically addresses Kenyan county health system (47 counties)
- [ ] Different from generic dashboards (explain in demo)

## ✅ Design & Usability (5 pts)

- [ ] Dashboard is mobile‑readable (test with Chrome DevTools)
- [ ] Alert cards show severity color (Red/Orange/Yellow/Green)
- [ ] Map changes color based on outbreak level
- [ ] Acknowledge button works and removes alert from list
- [ ] No more than 3 clicks to see current outbreaks

## ✅ Effectiveness & Efficiency (5 pts)

- [ ] Measurable impact statement: "Reduces outbreak detection from 14 days to <6 hours"
- [ ] Scalability claim: "From 47 Kenyan counties to East Africa (200M+ people)"
- [ ] Demo shows end‑to‑end flow: report → alert → map change → AI summary
- [ ] Solution addresses a high‑priority real‑world problem (epidemics)

---

## Final Score Target: 18+ / 20

### Bonus Points (optional, if time allows)

- [ ] OpenShift deployment with public URL
- [ ] Real Watson NLU integration (not mock)
- [ ] Trend chart (Recharts) on dashboard
- [ ] Screenshots of Bob generating code in README
```
