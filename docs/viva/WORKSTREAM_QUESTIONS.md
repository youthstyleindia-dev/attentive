# Atentiv — Viva Voce: Workstream & Workspace Questions
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

---

### Q1: What are the three automatic snapshot triggers?
**Answer:** Under SRS Section 6, automatic snapshots are triggered:
1. When switching away from a Workstream containing $\ge 3$ active tabs after $>20$ minutes of continuous focus.
2. When the user initiates a manual browser window close containing an active Workstream.
3. Prior to system shutdown / idle timeout when significant unpersisted task context exists.

### Q2: How does Quick Resume differ from browser session restore?
**Answer:** Native browser session restore reopens all tabs blindly, creating clutter and cognitive overload. Quick Resume re-establishes a single, coherent Workstream cluster in an isolated window, restoring only the relevant project tabs, their active focus, and associated decision traces.
