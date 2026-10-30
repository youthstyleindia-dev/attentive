# Data Flow Diagram

```mermaid
flowchart TB
  U[User] -->|browse / configure| CB[Chromium browser]
  CB -->|tab, window, idle, alarm events| BE[Background engine]
  CB -->|bounded page signals on supported pages| CS[Content script]
  CS --> BE
  BE -->|local rules and model| LI[Local intelligence]
  LI --> BE
  BE -->|repositories| DB[(IndexedDB)]
  BE -->|checkpoint / settings| STORE[(chrome.storage)]
  DB --> UI[Side Panel / Dashboard / Options]
  STORE --> UI
```

No Atentiv backend server is configured in the manifest. This diagram reflects the current packaged architecture and does not imply that every privacy or tracking requirement is verified.
