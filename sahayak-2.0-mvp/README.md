# SAHAYAK 2.0 – Working Prototype (MVP)

Voice-first, learning multi-agent system for public grievance redressal. A browser prototype of the Phase II design. No server, no build step, no packages.

> **Prototype status:** every number the app shows comes from synthetic or hand-written data inside the demo. Quote them only as "prototype self-test on synthetic data", never as field-pilot results.

## Run in VS Code

1. Install **VS Code** and open this folder: *File → Open Folder → sahayak-2.0-mvp*.
2. Accept the prompt to install the recommended extension **Live Server** (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server** (or click **Go Live** at the bottom right).
4. The app opens at `http://127.0.0.1:5500`. The microphone works in Chrome on this address.

No Live Server? Use any one of these in the VS Code terminal (`Ctrl + ~`):

```bash
python -m http.server 5500        # then open http://127.0.0.1:5500
npm start                         # needs Node.js; serves on port 5500
```

You can also just double-click `index.html`; everything except the microphone works from a local file.

## Run the tests

```bash
node tests/run-tests.js           # or: npm test
```

13 tests check the maths (word error rate, Kaplan–Meier, Charter cap, federated averaging) and the behaviour (routing, timers, replay, federated learning).

## Project layout

```
index.html        page shell (loads the two scripts below)
css/styles.css    styling
js/core.js        all logic, no DOM: departments, router, Kaplan–Meier timers,
                  word error rate, softmax learner, replay, federated averaging
js/ui.js          screens and events: Listener, Finder, Tracker, Messenger,
                  Advocate review, Learner, Results
tests/run-tests.js  Node tests for core.js
.vscode/          Live Server settings and a Chrome launch config
```

## Where each paper part lives

| Paper part | Code |
|---|---|
| Structured complaint ĉ, filing rule (Eq. 1–2) | `ui.js`: `listen()`, `confirmFile()` |
| Routing score and human hand-off (Eq. 3) | `core.js`: `route()`, `buildIndex()` |
| Replay loss (Eq. 4) | `core.js`: `runContinual()`, `LR.fit()` |
| Kaplan–Meier and first timer (Eq. 5–6) | `core.js`: `km()`, `learnedTimers()` |
| Algorithm 1 (escalation) | `ui.js`: `plan()`, `renderTrackBody()` |
| Advocate draft and grounding check | `ui.js`: `makeDraft()`, `groundCheck()` |
| Federated averaging (Eq. 7) | `core.js`: `avgModels()`, `runFederated()` |
| Word error rate | `core.js`: `wer()` |

## What is a stand-in

| Paper | This MVP | Production |
|---|---|---|
| IndicWhisper speech recognition | Browser Web Speech API or simulated notes | IndicWhisper on a GPU server |
| MuRIL embeddings | TF-IDF over character 3-grams | MuRIL encoder |
| Neo4j knowledge graph | In-memory table | Neo4j |
| Real portal history | Synthetic resolution history | Real history, `lifelines` |
| Portal polling | Simulated clock | Daily status polling |
| RAG language model | Template over illustrative snippets | RAG over real statutes and Charters |
| WhatsApp / SMS | Web page | WhatsApp Business API |

Department names, Charter days and legal text are illustrative, not official.

## Deploy

Netlify Drop (drag this folder to app.netlify.com/drop) or `npx vercel --prod` in this folder.
