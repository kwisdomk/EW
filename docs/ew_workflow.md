# EW_WORKFLOW.md — EpidemiWatch Sentinel 72-Hour Command Workflow
## IBM Dev Day: Bob Edition | Solo Dev Operational Blueprint
## Repository: EW
## Mission: Build a credible, IBM-aligned epidemic surveillance proof-of-concept in 72 hours.

---

# CORE OPERATING PRINCIPLE
## BUILD VERTICALLY, NOT HORIZONTALLY

### This means:
Complete one full end-to-end functional flow first:

# Mock Data → Quarkus Ingestion → Detection Engine → Alert API → Dashboard → Demo

### NOT:
Frontend alone  
Backend alone  
AI alone  

---

# PRIMARY OBJECTIVE
## Build:
### “EpidemiWatch Sentinel — Public Health Threat Intelligence Platform”

### For:
County Health Officers / Public Health Decision Makers

---

# SUCCESS CONDITION
By submission:
## A judge should be able to:
### 1. Submit disease report  
### 2. Trigger anomaly detection  
### 3. View alert  
### 4. See county severity visualization  
### 5. Receive AI-generated outbreak summary  

---

# MASTER STACK (LOCKED)
## Backend:
- Quarkus
- RESTEasy Reactive
- Hibernate Panache
- H2 (MVP first)
- PostgreSQL (optional upgrade)

## Frontend:
- React (Vite)
- Tailwind CSS
- Dashboard UI

## AI:
- IBM Watson / Mock Watson Summary Fallback
- IBM Bob (code generation)
- LangChain4j (only if stable after MVP)

## Deployment:
- OpenShift (Primary)
- Local Docker (Fallback)

---

# COMMAND STRUCTURE
## You:
Lead Architect + Integrator + Validator

## IBM Bob:
Scaffold + Boilerplate + Quarkus APIs + Deployment configs

## ChatGPT:
Architecture + Workflow + Strategic scope + Build discipline

## Gemini:
Supplemental ideation + alternate implementation options

---

# NON-NEGOTIABLE RULES
## RULE 1:
If a feature does not improve judging score significantly:
### CUT IT

---

## RULE 2:
If deployment risk exceeds value:
### FALLBACK

---

## RULE 3:
Working prototype > perfect architecture

---

## RULE 4:
Every major IBM Bob output:
### Screenshot it
### Log it
### Store in /docs/bob_logs/

---

# PROJECT STRUCTURE
```txt
EW/
│── README.md
│── docs/
│   ├── EW_WORKFLOW.md
│   ├── IBM_BOB_PROMPTS.md
│   ├── JUDGING_CHECKLIST.md
│   ├── FAILSAFE.md
│   ├── DATA_SCHEMA.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── bob_logs/
│
│── backend/
│── frontend/
│── data/
│   └── mock/