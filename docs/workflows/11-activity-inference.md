# Workflow 11 — Activity Taxonomy Inference
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-09)

## 1. Orthogonal Separation
Atentiv strictly maintains separation between four concepts:
- **Category:** Domain/topic classification (e.g. `Technology`, `Education`, `Entertainment`).
- **Activity:** The specific action the user is performing (e.g. `Coding`, `Debugging`, `Reading`, `Lecture`).
- **Productivity:** Value orientation (`+1` Productive, `0` Neutral, `-1` Distracting).
- **Workstream:** The unified multi-tab project thread.

## 2. Deterministic Mapping Examples
- Google + "Python import error" $\rightarrow$ Activity: `Research`
- StackOverflow + error keywords $\rightarrow$ Activity: `Debugging`
- GitHub repo $\rightarrow$ Activity: `Coding`
- YouTube + "Machine Learning Lecture" $\rightarrow$ Activity: `Lecture`
