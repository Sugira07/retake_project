# Retake_project

Dear sir, my project which i named retake_project is a good ai-based project designed to teach programming to students based on their level of understaning, the retake_project understands your lvel based on how  your answer the short quizes it gives you and then updates your as the programming knowledge rises. 
additianally, i named this project retake for an easy identification purpose but it's origianl name is paradigm path based on how it works and what it does.

## Run locally

Use Python 3 (already available on most Linux installations). From this folder:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000> in a browser. Press `Ctrl+C` in the terminal to stop the local server.

You can also open `index.html` directly, but using the local server gives consistent browser storage behavior.

## Try the adaptive tutor

1. Start a quick practice from the recommendation card, or choose one of the four topic cards.
2. Answer the three questions. The mastery estimate updates after each answer.
3. Read the feedback and complete the session to see the next recommendation.
4. Open **How your AI works** to inspect all mastery estimates and the model parameters.
5. Refresh the page. Progress persists in this browser's local storage.

Use **Reset learning data** on the model page to start over. Progress is stored only in your browser under the `paradigmpath-learning-v1` key.

## Folder structure

```text
paradigm-path/
├── index.html    # Accessible page structure and navigation
├── styles.css    # Responsive visual design
├── app.js        # Curriculum, quiz flow, BKT, recommendations, local storage
├── README.md     # Setup and usage
└── DESIGN.md     # AI model, formulas, design rationale, limitations
```

## Project goals

- **AI:** estimate concept mastery probabilistically and adapt practice locally.
- **Programming paradigms:** teach and compare functional and imperative thinking, recursion, and higher-order functions.
- **Software engineering:** separate structure, styling, and behavior; handle persistent state; make the model explainable; design a responsive and keyboard-operable interface.

See [DESIGN.md](DESIGN.md) for the model equations, recommendation logic, scope, and limitations.
