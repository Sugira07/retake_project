"use strict";

const MODEL = Object.freeze({ guess: 0.20, slip: 0.10, learn: 0.12 });
const STORAGE_KEY = "paradigmpath-learning-v1";

const SKILLS = [
  {
    id: "functional",
    title: "Functional thinking",
    shortTitle: "Functional",
    description: "Pure functions, values & predictable code.",
    icon: "λ",
    color: "#7867c6",
    tint: "#eee9ff",
    questions: [
      { prompt: "What value does this function return when called with 4?", code: "const double = x => x * 2;\ndouble(4)", options: ["8", "6", "It changes x to 8"], correct: 0, explanation: "A pure function computes and returns a value. With 4 as input, x * 2 evaluates to 8 without changing anything outside the function." },
      { prompt: "Which description best fits a pure function?", options: ["It returns the same output for the same input and has no side effects.", "It changes a global variable every time it runs.", "It can only be used once."], correct: 0, explanation: "A pure function is predictable: the same input gives the same output, and evaluating it does not mutate external state." },
      { prompt: "Why are immutable values useful in functional programming?", options: ["They make it easier to reason about how data changes.", "They make every program run in constant time.", "They remove the need for functions."], correct: 0, explanation: "When a value cannot be changed in place, you can trace where each value came from without worrying about a hidden mutation." }
    ]
  },
  {
    id: "imperative",
    title: "Imperative state",
    shortTitle: "Imperative",
    description: "Variables, commands & step-by-step change.",
    icon: "↻",
    color: "#4588a8",
    tint: "#e5f2f8",
    questions: [
      { prompt: "What is the value of count after these statements?", code: "let count = 2;\ncount = count + 1;\ncount = count * 2;", options: ["6", "3", "4"], correct: 0, explanation: "Imperative code changes state one command at a time: 2 becomes 3, then 3 becomes 6." },
      { prompt: "What is mutable state?", options: ["Data whose value can change as the program runs.", "A value that is always a string.", "A function with no return value."], correct: 0, explanation: "Mutable state can be updated over time, such as a counter that changes inside a loop." },
      { prompt: "Which style most clearly describes this code?", code: "total = 0\nfor price in prices:\n    total = total + price", options: ["Imperative: commands update a running total.", "Functional: no values ever change.", "Declarative: it only describes the final result."], correct: 0, explanation: "The loop gives explicit steps, and total is repeatedly updated. That is a common imperative pattern." }
    ]
  },
  {
    id: "recursion",
    title: "Recursion",
    shortTitle: "Recursion",
    description: "Solve a problem by reducing it to itself.",
    icon: "⤴",
    color: "#bd7b49",
    tint: "#fff0e5",
    questions: [
      { prompt: "What is the main purpose of a base case in recursion?", options: ["To stop the recursive calls when the problem is small enough.", "To make the function call itself forever.", "To store every result in a global variable."], correct: 0, explanation: "A base case ends the chain of calls. Without one, recursion usually continues until the program runs out of stack space." },
      { prompt: "What does this function return for factorial(3)?", code: "factorial(n) =\n  if n == 1: 1\n  else: n * factorial(n - 1)", options: ["6", "3", "1"], correct: 0, explanation: "factorial(3) becomes 3 × factorial(2), then 2 × factorial(1), which reaches the base case: 3 × 2 × 1 = 6." },
      { prompt: "For recursion to make progress, each call should usually…", options: ["Move closer to a base case.", "Use exactly the same input forever.", "Create a new global variable."], correct: 0, explanation: "Each recursive call should reduce the problem in some way, so it eventually reaches the base case." }
    ]
  },
  {
    id: "higher-order",
    title: "Higher-order functions",
    shortTitle: "Higher-order",
    description: "Use functions as inputs and outputs.",
    icon: "ƒ",
    color: "#a56891",
    tint: "#f8eaf2",
    questions: [
      { prompt: "What does map do in this example?", code: "[1, 2, 3].map(n => n * 2)", options: ["Creates a new list with each number doubled.", "Keeps only the number 2.", "Sorts the list from largest to smallest."], correct: 0, explanation: "map applies the callback function to each item and returns the transformed list: [2, 4, 6]." },
      { prompt: "What makes a function higher-order?", options: ["It takes a function as an argument or returns one.", "It has more than ten lines.", "It always runs faster than a loop."], correct: 0, explanation: "A higher-order function treats functions as values: it can receive a function or produce one as its result." },
      { prompt: "What does filter return here?", code: "[2, 5, 8, 9].filter(n => n % 2 === 0)", options: ["A new list containing 2 and 8.", "A new list containing 5 and 9.", "The number 4."], correct: 0, explanation: "filter keeps the items for which the callback is true. Only 2 and 8 are even." }
    ]
  }
];

function initialState() {
  return {
    skills: Object.fromEntries(SKILLS.map(skill => [skill.id, { mastery: 0.25, attempts: 0, correct: 0 }])),
    totalAnswers: 0,
    sessions: 0,
    lastSkill: null
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return initialState();
    const fresh = initialState();
    for (const skill of SKILLS) {
      const data = saved.skills?.[skill.id];
      if (data && Number.isFinite(data.mastery)) {
        fresh.skills[skill.id] = {
          mastery: Math.min(1, Math.max(0, data.mastery)),
          attempts: Math.max(0, Number(data.attempts) || 0),
          correct: Math.max(0, Number(data.correct) || 0)
        };
      }
    }
    fresh.totalAnswers = Math.max(0, Number(saved.totalAnswers) || 0);
    fresh.sessions = Math.max(0, Number(saved.sessions) || 0);
    fresh.lastSkill = SKILLS.some(skill => skill.id === saved.lastSkill) ? saved.lastSkill : null;
    return fresh;
  } catch {
    return initialState();
  }
}

let state = loadState();
let activeSession = null;
let currentView = "dashboard";
let toastTimer;

const byId = id => document.getElementById(id);
const percent = value => `${Math.round(value * 100)}%`;
const skillById = id => SKILLS.find(skill => skill.id === id);

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast("Browser storage is unavailable; progress may not persist.");
  }
}

function statusFor(skillState) {
  if (skillState.attempts === 0) return "Not started";
  if (skillState.mastery >= 0.78) return "Confident";
  if (skillState.mastery >= 0.48) return "Growing";
  return "Building";
}

function priorityFor(skill) {
  const progress = state.skills[skill.id];
  const mastery = progress.mastery;
  const expectedGain = (1 - mastery) * (0.6 + 0.4 * (1 - mastery));
  const baselineBonus = progress.attempts === 0 ? 0.06 : 0;
  const repeatPenalty = state.lastSkill === skill.id ? 0.12 : 0;
  return expectedGain + baselineBonus - repeatPenalty;
}

function recommendedSkill() {
  return SKILLS.reduce((best, skill) => priorityFor(skill) > priorityFor(best) ? skill : best, SKILLS[0]);
}

function recommendationText(skill) {
  const progress = state.skills[skill.id];
  if (progress.attempts === 0) {
    return `You haven’t practiced ${skill.title.toLowerCase()} yet. A short baseline quiz will help the tutor estimate where to begin.`;
  }
  return `Your estimated mastery is ${percent(progress.mastery)} after ${progress.attempts} answer${progress.attempts === 1 ? "" : "s"}. This concept has the highest practice priority right now.`;
}

function renderDashboard() {
  const recommendation = recommendedSkill();
  const progress = state.skills[recommendation.id];
  byId("recommendation-title").textContent = recommendation.title;
  byId("recommendation-reason").textContent = recommendationText(recommendation);
  byId("rec-mastery").textContent = percent(progress.mastery);
  byId("rec-match").textContent = progress.attempts === 0 ? "Start with a baseline" : `${progress.attempts} answer${progress.attempts === 1 ? "" : "s"} inform this`;
  byId("concepts-explored").innerHTML = `${SKILLS.filter(skill => state.skills[skill.id].attempts > 0).length} <small>/ ${SKILLS.length}</small>`;
  byId("questions-answered").textContent = state.totalAnswers;
  const average = SKILLS.reduce((sum, skill) => sum + state.skills[skill.id].mastery, 0) / SKILLS.length;
  byId("overall-mastery").textContent = percent(average);
  byId("streak-value").textContent = state.sessions;
  byId("start-recommended").dataset.skill = recommendation.id;
  byId("skill-grid").innerHTML = SKILLS.map(skill => {
    const item = state.skills[skill.id];
    return `<article class="skill-card" style="--skill:${skill.color};--tint:${skill.tint}">
      <div class="skill-card-top"><span class="skill-icon" aria-hidden="true">${skill.icon}</span><span class="skill-status">${statusFor(item)}</span></div>
      <h3>${skill.title}</h3><p>${skill.description}</p>
      <div class="skill-progress-row"><div class="skill-progress" aria-label="${percent(item.mastery)} mastery"><span style="width:${percent(item.mastery)}"></span></div><span class="skill-percent">${percent(item.mastery)}</span></div>
      <button class="card-hit" data-start-skill="${skill.id}" aria-label="Practice ${skill.title}"></button>
    </article>`;
  }).join("");
  renderModel();
}

function renderModel() {
  const recommendation = recommendedSkill();
  byId("model-skills").innerHTML = SKILLS.map(skill => {
    const item = state.skills[skill.id];
    return `<div class="model-skill-row" style="--skill:${skill.color};--tint:${skill.tint}">
      <div class="model-skill-name"><span class="model-mini-icon" aria-hidden="true">${skill.icon}</span>${skill.shortTitle}</div>
      <div class="model-bar" role="progressbar" aria-label="${skill.title} mastery estimate" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(item.mastery * 100)}"><span style="width:${percent(item.mastery)}"></span></div>
      <div class="model-value">${percent(item.mastery)}</div>
    </div>`;
  }).join("");
  byId("model-recommendation-title").textContent = `Practice ${recommendation.title.toLowerCase()}.`;
  byId("model-recommendation-reason").textContent = recommendationText(recommendation);
  const item = state.skills[recommendation.id];
  byId("priority-explanation").textContent = `At ${percent(item.mastery)} estimated mastery, this concept has the highest expected learning opportunity. The score also gives a small baseline bonus to new concepts and a repeat penalty to the last one practiced.`;
  byId("model-start-practice").dataset.skill = recommendation.id;
}

function setView(view) {
  currentView = view;
  byId("dashboard-view").classList.toggle("hidden", view !== "dashboard");
  byId("model-view").classList.toggle("hidden", view !== "model");
  byId("quiz-view").classList.toggle("hidden", view !== "quiz");
  const labels = { dashboard: "Overview", model: "How your AI works", quiz: "Personalized practice" };
  byId("page-crumb").textContent = labels[view];
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.nav === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startSession(skillId) {
  const skill = skillById(skillId);
  if (!skill) return;
  const progress = state.skills[skillId];
  activeSession = {
    skillId,
    questionIndex: 0,
    questionIds: Array.from({ length: 3 }, (_, index) => (progress.attempts + index) % skill.questions.length),
    correct: 0,
    startingMastery: progress.mastery,
    answered: null
  };
  setView("quiz");
  renderQuestion();
}

function renderQuestion() {
  if (!activeSession) return;
  const skill = skillById(activeSession.skillId);
  const question = skill.questions[activeSession.questionIds[activeSession.questionIndex]];
  const answered = activeSession.answered;
  const isLast = activeSession.questionIndex === activeSession.questionIds.length - 1;
  byId("quiz-content").innerHTML = `<div class="quiz-wrap" style="--skill:${skill.color};--tint:${skill.tint}">
    <div class="quiz-context"><span class="quiz-context-icon" aria-hidden="true">${skill.icon}</span><div><strong>${skill.title}</strong><span>Adaptive practice · about 3 minutes</span></div></div>
    <div class="quiz-progress-row"><span>Question ${activeSession.questionIndex + 1} of ${activeSession.questionIds.length}</span><div class="quiz-progress"><span style="width:${((activeSession.questionIndex + (answered ? 1 : 0)) / activeSession.questionIds.length) * 100}%"></span></div><span>${Math.round(((activeSession.questionIndex + (answered ? 1 : 0)) / activeSession.questionIds.length) * 100)}%</span></div>
    <article class="question-card"><p class="question-kicker">QUICK CHECK</p><h1 class="question-title" id="quiz-title">${question.prompt}</h1>
      ${question.code ? `<code class="code-snippet">${escapeHtml(question.code)}</code>` : ""}
      <div class="answer-list" role="group" aria-label="Choose an answer">${question.options.map((option, index) => {
        const resultClass = answered === null ? "" : index === question.correct ? "correct" : index === answered.selected && !answered.correct ? "incorrect" : "";
        return `<button class="answer-option ${resultClass}" data-answer="${index}" ${answered !== null ? "disabled" : ""}><span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`;
      }).join("")}</div>
      <div class="answer-feedback ${answered === null ? "" : `show ${answered.correct ? "good" : "try-again"}`}" aria-live="polite">${answered === null ? "" : `<strong>${answered.correct ? "That’s right." : "Not quite yet."}</strong>${question.explanation}`}</div>
      <div class="question-footer"><span class="confidence-note">Your answer updates your mastery estimate.</span><button class="primary-button continue-button ${answered === null ? "hidden" : ""}" data-continue>${isLast ? "See your summary" : "Next question"}<span aria-hidden="true">→</span></button></div>
    </article>
  </div>`;
}

function answerQuestion(selected) {
  if (!activeSession || activeSession.answered !== null) return;
  const skill = skillById(activeSession.skillId);
  const question = skill.questions[activeSession.questionIds[activeSession.questionIndex]];
  const correct = selected === question.correct;
  const progress = state.skills[skill.id];
  progress.mastery = updateMastery(progress.mastery, correct);
  progress.attempts += 1;
  if (correct) {
    progress.correct += 1;
    activeSession.correct += 1;
  }
  state.totalAnswers += 1;
  activeSession.answered = { selected, correct };
  saveState();
  renderDashboard();
  renderQuestion();
}

function updateMastery(prior, correct) {
  const likelihoodKnown = correct ? 1 - MODEL.slip : MODEL.slip;
  const likelihoodUnknown = correct ? MODEL.guess : 1 - MODEL.guess;
  const numerator = prior * likelihoodKnown;
  const denominator = numerator + (1 - prior) * likelihoodUnknown;
  const posterior = denominator === 0 ? prior : numerator / denominator;
  return posterior + (1 - posterior) * MODEL.learn;
}

function finishSession() {
  if (!activeSession) return;
  state.sessions += 1;
  state.lastSkill = activeSession.skillId;
  saveState();
  const skill = skillById(activeSession.skillId);
  const item = state.skills[skill.id];
  const next = recommendedSkill();
  const delta = item.mastery - activeSession.startingMastery;
  byId("quiz-content").innerHTML = `<div class="quiz-result">
    <div class="result-medal" aria-hidden="true">✦</div><p class="eyebrow">PRACTICE COMPLETE</p><h1>Nice work showing up.</h1>
    <p>You practiced ${skill.title.toLowerCase()}. The tutor used each answer as evidence and updated its estimate of your understanding.</p>
    <div class="result-score"><div><strong>${activeSession.correct} / ${activeSession.questionIds.length}</strong><span>answers correct</span></div><div><strong>${percent(item.mastery)}</strong><span>estimated mastery now</span></div><div><strong>+${Math.max(0, Math.round(delta * 100))}%</strong><span>change this session</span></div></div>
    <div class="result-recommendation"><span aria-hidden="true">✳</span><div><strong>Suggested next: ${next.title}</strong><small>${recommendationText(next)}</small></div></div>
    <div class="result-actions"><button class="secondary-button" data-nav="dashboard">Back to overview</button><button class="primary-button" data-start-skill="${next.id}">Continue learning <span aria-hidden="true">→</span></button></div>
  </div>`;
  renderDashboard();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-nav]");
  if (nav) {
    if (activeSession && currentView === "quiz") activeSession = null;
    setView(nav.dataset.nav);
    return;
  }
  const start = event.target.closest("[data-start-skill], #start-recommended, #model-start-practice");
  if (start) {
    startSession(start.dataset.startSkill || start.dataset.skill);
    return;
  }
  const answer = event.target.closest("[data-answer]");
  if (answer) {
    answerQuestion(Number(answer.dataset.answer));
    return;
  }
  if (event.target.closest("[data-continue]")) {
    if (!activeSession) return;
    if (activeSession.questionIndex + 1 >= activeSession.questionIds.length) {
      finishSession();
    } else {
      activeSession.questionIndex += 1;
      activeSession.answered = null;
      renderQuestion();
    }
    return;
  }
  if (event.target.closest("#leave-quiz")) {
    activeSession = null;
    setView("dashboard");
    return;
  }
  if (event.target.closest("#reset-progress")) {
    if (window.confirm("Reset all learning progress saved in this browser?")) {
      state = initialState();
      activeSession = null;
      saveState();
      renderDashboard();
      showToast("Learning progress reset.");
    }
  }
});

renderDashboard();
setView("dashboard");
