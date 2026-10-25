# ParadigmPath — model and design notes

## Purpose

ParadigmPath is an adaptive tutor for introductory programming paradigms. A learner answers short concept questions; the app estimates their mastery and chooses what to practice next. The goal is not to claim that a small demo knows a learner perfectly. The goal is to implement a real, inspectable probabilistic model and show how evidence changes its decisions.

## AI method: Bayesian Knowledge Tracing

Each concept has its own probability `P(L)` that the learner has mastered it. Every concept starts with a 25% prior. The app uses four interpretable parameters:

- `P(G) = 0.20`: chance of a correct guess when the concept is not mastered.
- `P(S) = 0.10`: chance of a slip when the concept is mastered.
- `P(T) = 0.12`: chance of learning the concept during an attempt.
- `P(L₀) = 0.25`: initial mastery probability.

For a correct answer, Bayes' rule updates the probability:

```text
P(L | correct) = P(L)(1 - P(S)) /
                 [P(L)(1 - P(S)) + (1 - P(L))P(G)]
```

For an incorrect answer:

```text
P(L | incorrect) = P(L)P(S) /
                   [P(L)P(S) + (1 - P(L))(1 - P(G))]
```

Then the learning transition is applied:

```text
P(L)' = P(L | answer) + [1 - P(L | answer)]P(T)
```

The recommendation score favors concepts with more remaining learning opportunity, gives a small bonus to concepts with no baseline attempt, and applies a small penalty to the topic practiced most recently. The website displays current mastery estimates and explains why it chose the next topic.

## Website behavior

- Four concept areas: functional thinking, imperative state, recursion, and higher-order functions.
- Three questions per short practice session, with explanations after each answer.
- Mastery probability updates after every response.
- A recommendation changes as mastery estimates change.
- Progress persists in browser local storage and can be reset.
- The model page shows every estimate, parameters, and a plain-language account of the recommendation.

## Programming paradigms

The site content introduces functional programming through pure functions and immutability, and imperative programming through commands and mutable state. Recursion and higher-order functions show common techniques that cross language styles. The AI implementation itself is written with functional updates to probabilities and imperative browser event/state management.

## Software engineering choices

- Semantic HTML, responsive CSS, and plain JavaScript keep the project easy to inspect and run.
- Curriculum data, model calculations, rendering, and interaction handling have distinct functions.
- State is validated when loaded from local storage and every persisted change uses a versioned storage key.
- The interface supports keyboard-operable buttons, visible focus, reduced-motion preferences, and live answer feedback.
- No answer history or personal profile leaves the browser. There are no API calls or external JavaScript dependencies.

## Evaluation plan

Demonstrate the model from a clean state: record each concept's initial 25% estimate, answer all three questions in one topic correctly, and show that its estimate rises. Reset and repeat with incorrect answers to show that the estimate responds to evidence in the opposite direction. Then practice a second topic and show the recommendation shift to the area with greater estimated learning need.

For a more formal evaluation, compare model recommendations with a non-adaptive round-robin baseline over simulated learner profiles. Measure whether the selected topic matches each simulated learner's weakest concept, and report the result for multiple generated profiles.

## Limitations

- The question bank is small and fixed; this is an educational prototype, not a validated assessment.
- BKT parameters are illustrative defaults, not fitted from a real classroom dataset.
- A correct multiple-choice answer is imperfect evidence of understanding; guessing and question difficulty are simplified.
- Browser local storage is device-specific and is not a secure account system.
- No generated prose or neural model is used. The AI component is Bayesian inference and adaptive selection, which should be described accurately as a probabilistic learner model.
