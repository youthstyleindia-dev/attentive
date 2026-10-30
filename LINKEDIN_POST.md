# 🚀 Announcing Atentiv: Privacy-First, On-Device AI Cognitive Attention Management & Audio Distraction Classification for the Modern Web

I’m thrilled to open-source **Atentiv** — an AI-powered cognitive attention companion built as a Chromium Manifest V3 extension, featuring **100% on-device FastText WASM machine learning, real-time background audio classification, and semantic tab workstream clustering**.

🔗 **GitHub Repository**: https://github.com/youthstyleindia-dev/attentive  
📄 **Full IEEE Research Paper**: [IEEE_RESEARCH_PAPER.md](https://github.com/youthstyleindia-dev/attentive/blob/main/IEEE_RESEARCH_PAPER.md)  
🎥 **Full Product Demo (1080p 60fps)**: `Atentiv_Full_Product_Demo_With_Audio_Verification.mp4`

---

### 🧠 The Problem: The Single-Tab Auditory Blind Spot

Knowledge workers spend over 80% of their screen time inside web browsers, switching contexts dozens of times an hour. But existing productivity trackers suffer from three major architectural flaws:

1. **The Auditory Blind Spot**: They only measure the single active foreground tab. If you are listening to an MIT Deep Learning lecture or a technical podcast in the background while coding, classical trackers flag you as "idle" and penalize your focus score. Conversely, if you play an esports livestream or Netflix drama in the background, the distraction goes completely undetected.
2. **Cloud Telemetry Risks**: Many modern tools send your visited URLs, document titles, and private DOM text to remote cloud LLMs — violating enterprise data compliance (GDPR/CCPA) and risking leaks of sensitive tokens or internal dashboards.
3. **DOM Pollution**: Injected banners often clash with website stylesheets or break responsive page layouts.

---

### 💡 The Solution: Atentiv’s Decoupled On-Device Architecture

We designed Atentiv from first principles to deliver deep cognitive ergonomics while preserving absolute privacy:

#### 1. 🔒 100% On-Device FastText WASM Inference
No cloud API calls. No remote server round-trips. Text classification executes locally inside WebAssembly in **under 1 millisecond** across 13 canonical cognitive taxonomies (Software Engineering, Academic Research, Deep Learning, Collaboration, etc.).

#### 2. 🎧 Decoupled Audio Classification & Distraction Verification
Atentiv listens to Chrome's native `tab.audible` signals and evaluates media semantics and acoustic profiles in real time:
* **Educational Focus Aid Exception (FR-03)**: Detected university lectures, instructional talks, and lo-fi focus masks receive semantic discount modifiers (e.g. `-25 pts`), award focus bonuses, and suppress the 180s inactivity timeout!
* **High-Tempo Distraction Amplification**: Entertainment livestreams and high-tempo media receive distraction penalties (`+25 pts`), alerting you to task fragmentation without halting your active foreground tab.
* **Autonomous Audio Sessions**: Maintained concurrently in local IndexedDB without resetting or corrupting foreground dwell time.

#### 3. 🧭 Open Tabs Clustered by Workstream + 1-Click Restore
Say goodbye to tab overload. Atentiv automatically clusters open tabs into semantic task groups (`Design & Development`, `Reference & Docs`, etc.) using local vector similarity. Click **`+ Save`** on any workstream header to snapshot it into persistent workspace storage, and click **`▶ Open`** to rehydrate all grouped tabs in **under 50 milliseconds**.

#### 4. 🪟 Isolated Shadow DOM Floating Glass HUD
Atentiv injects a sleek, frosted-glass cockpit into your active page inside an isolated **Shadow DOM (`#atentiv-v3`)**. It never clashes with host CSS, never causes DOM layout shifts, and expands on demand (`Alt+A`) into a 3-column command center displaying dwell time, attention metrics, and active streams.

#### 5. 🛡️ Strict Zero-Telemetry Invariant
Every byte of tracking history, classification embeddings, and workspace snapshots is stored client-side in **Dexie IndexedDB**. Network auditing confirms **0 outbound HTTP/WebSocket requests**. Users have instant 1-click JSON export and complete data purge control.

---

### 📊 Validation & Verification

* **75 / 75 Automated Unit & Integration Tests Passing** (`npm test`)
* **3 Automated Playwright End-to-End Browser Suites Passing** (`npm run test:browser`)
* **Formal Privacy & Security Audit**: Verified zero external network egress ($N_{\text{egress}} = 0$).

---

### 🎥 Watch the Demo & Explore the Code

Check out the full repository to read the complete architecture specs, review the IEEE research paper, and try out the extension:

👉 **Star & Fork the Repo on GitHub**:  
https://github.com/youthstyleindia-dev/attentive

I’d love to hear your thoughts, feedback, and ideas! How do you manage your cognitive focus and tab overload across deep work sessions?

---

#OpenSource #ArtificialIntelligence #MachineLearning #WebAssembly #FastText #Productivity #HumanComputerInteraction #TypeScript #ChromeExtension #CyberSecurity #DataPrivacy #DeepWork #SoftwareEngineering
